const express = require('express')
const bodyParser = require('body-parser');
const query = require('./module/mysql')
const { nodemailer, message, randoms, timestamp } = require('./module/mail');
const TOKEN = require('./module/token');
const { payUrl } = require('./module/sign')
let $ = new TOKEN();
let SERCET = "biubiul.1234";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//跨域
app.all("*", function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "content-type,Authorization");
        res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
        if (req.method.toLowerCase() == 'options')
            res.send(200);
        else
            next();
    })
    //静态资源
app.get('/', express.static('public'));
//首页电影请求接口
app.post('/getMovie', async(req, res) => {
    let tags = ["剧情", "恐怖", "战争", "科幻", "爱情", "动作", '纪录'];
    let movies = await query(`SELECT * FROM movie where tag like "%${tags[req.body.index]}%" limit 30`);
    res.send(movies)
});
//搜索电影请求接口
app.post('/searchMovie', (req, res) => {
    let page = 1;
    let num = 30;
    // SELECT * FROM movie where movie (like '%${req.body.searchVal}%' or auth like '%${req.body.searchVal}%') limit 0,30
    query(`SELECT * FROM movie where movie like '%${req.body.searchVal}%' or auth like '%${req.body.searchVal}%' limit 0,30`).then((result, error) => {
        if (error) {
            res.status(200).send({ msg: '无搜索结果' });
        } else {
            res.status(200).send(result);
        }
    }).catch(err => {
        res.status(200).send({ msg: '无搜索结果' });

    })
});

//根据id去请求电影详情
app.post('/information', (req, res) => {
    query(`SELECT * FROM movie where id = '${req.body.id}'`).then(result => {
        res.status(200).send(result)
    }).catch(err => {
        res.status(500).send({ msg: '发生错误' })
    })
});

//添加商品到购物车
app.post('/addShop', (req, res) => {
    let { id, movie, picture, onePrice, number, allPrice, checks, success } = req.body;
    let token = req.headers.authorization.split(' ').pop();
    $.verify(token, SERCET).then(async result => {
        let arr = [result.userId, id, movie, picture, onePrice, number, allPrice, checks, success];
        await query(`insert into shopCar (userId,id,movie,picture,onePrice,number,allPrice,checks,success) values (?,?,?,?,?,?,?,?,?)`, arr).then(results => {
            res.status(200).send({ msg: '添加成功', results });
        }).catch(err => {
            console.log(err);
            res.status(202).send({ msg: '未知错误，请稍后再试' });
        })
    }).catch(err => {
        console.log(err);
        res.status(401).send({ msg: 'token无效，请重新登录' });
    })
});
//删除购物车商品
app.post('/deleteShop', (req, res) => {
    let token = req.headers.authorization.split(' ').pop();
    $.verify(token, SERCET).then(async result => {
        await query(`DELETE FROM shopcar WHERE userId = ${result.userId} and id = ${req.body.id} `).then(results => {
            res.status(200).send({ msg: 'success' });
        })
    }).catch(err => {
        console.log(err);
        res.status(401).send({ msg: 'token无效，请重新登录' });
    })
});
//从购物车里获取
app.post('/getShop', (req, res) => {
    let token = req.headers.authorization.split(' ').pop();
    $.verify(token, SERCET).then(async result => {
        await query(`select * from shopCar where userId = ${result.userId} and success = ${req.body.status}`).then(results => {
            res.status(200).send({ msg: '获取成功', results });
        }).catch(err => {
            res.status(202).send({ msg: '未知错误，请稍后再试' });
        })
    }).catch(err => {
        console.log(err);
        res.status(401).send({ msg: 'token无效，请重新登录' });
    })
});

// 检查用户名是否可用
app.post('/checkUser', (req, res) => {
        let { username } = req.body;
        let sql = `select * from user where username ='${username}'`;
        query(sql, []).then((result, error) => {
            if (error) {
                res.send({ status: 504, msg: '未知错误' });
            } else if (result.length == 0) {
                res.send({ status: 200, msg: '用户名可用' });
            } else {
                res.send({ status: 202, msg: '用户名被占用' });
            }
        })
    })
    //支付
app.post('/pay', (req, res) => {
        let token = req.headers.authorization.split(' ').pop();
        $.verify(token, SERCET).then(async result => {
            let date = new Date();
            let trade = '' + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
            let data = {
                pid: "135211",
                // money: req.body.totalPrice,
                money: req.body.totalPrice,
                name: req.body.name,
                notify_url: "http://pay.hackwl.cn/notify_url.php", //异步通知地址
                out_trade_no: trade, //订单号,自己生成。我是当前时间YYYYMMDDHHmmss再加上随机三位数
                return_url: "https://movie.songjintao.cn/deal", //跳转通知地址
                sitename: "Movie",
                type: req.body.type, //支付方式:alipay:支付宝,wxpay:微信支付,qqpay:QQ钱包,tenpay:财付通,
            }
            let results = await payUrl(data);
            res.status(200).send(results);
        }).catch(err => {
            res.status(401).send({ msg: 'token无效' })
        })
    })
    //支付完成修改商品状态
app.post('/deal', (req, res) => {
    let token = req.headers.authorization.split(' ').pop();
    $.verify(token, SERCET).then(result => {
        let allPromise = req.body.arr.map(e => {
            return query(`update shopcar set onePrice = ${e.onePrice},allPrice = ${e.allPrice},number = ${e.number},success = 1 where userId = ${result.userId} and id = ${e.id}`);
        });
        Promise.all(allPromise).then(result => {
            res.status(200).send({ msg: 'success' });
        }).catch(err => {
            res.status(202).send(err)
        })
    })
})

//登录
app.post('/login', async(req, res) => {
        let { username, password } = req.body;
        let sql = `select * from user where username ='${username}'`;
        await query(sql, []).then((result, error) => {
            if (error) {
                res.send({ status: 504, msg: '服务器发生错误' });
            } else if (result.length == 0) {
                res.status(203).send({ msg: '账号或密码错误' });
            } else {
                if (password === result[0].password) {
                    let token = $.sign(result[0].userId, SERCET);
                    res.send({ status: 200, token: token, msg: '登录成功', username: result[0].username });
                } else {
                    res.status(203).send({ msg: '账号或密码错误' });
                }
            }
        })
    })
    //判断用户token是否有效 是否还登录
app.post('/refresh', (req, res) => {
    let token = req.headers.authorization.split(' ').pop();
    $.verify(token, SERCET).then(result => {
        res.status(200).send({ msg: 'token有效' })
    }).catch(err => {
        res.status(401).send({ msg: 'token无效，重新登录' })
    })
});
//注册
app.post('/register', async(req, res) => {
        let code = req.body.mailCode;
        let result = await query(`SELECT * FROM code where code = ${code}`);
        if (result.length == 0) {
            res.status(203).send({ msg: "请输入正确的验证码" })
        } else if (timestamp - result[0].date > 10 * 60 * 1000) {
            res.status(202).send({ msg: "验证码超时" })
        } else {
            let arr2 = [randoms(9), req.body.username, req.body.mail, req.body.password];
            let result2 = await query(`insert into user (id,userId,username,mail,password) values (id,?,?,?,?)`, arr2);
            if (result2.serverStatus == 2) {
                res.send({ status: 200, msg: '注册成功！' })
            } else {
                res.send({ status: 504, msg: '服务端出错' });
            }
        }
    })
    //发送邮箱验证码
app.post('/sendMail', async(req, res) => {
    let random = randoms(6);
    let info = await message.sendMail({
        from: "691736657@qq.com",
        to: req.body.mail,
        subject: "感谢你使用Movie",
        text: `你的验证码是${random},验证码有效期为10分钟,打死都不要把验证码给别人哦【Movie】`,
    });
    let arr = [random, timestamp];
    let saveCode = await query('insert into code (id,code,date) values (id,?,?)', arr, res);
    if (info.response == "250 OK: queued as." && saveCode) {
        let result = {
            messageId: info.messageId,
            reponse: info.response,
            saveCode: saveCode,
            status: 200
        }
        res.send(result)
    } else {
        let error = {
            saveCode,
            info
        }
        res.send({ status: 504, msg: '服务端发生错误' });
    }
});



// app.get('/b', (req, res) => {
//     let k = $.sign('songjintao1111111111111111111111111111111', SERCET);
//     res.send(k);

app.listen(3003, () => {
    console.log("serve is running on 3003")
})