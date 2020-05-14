// let pid = "135211";


function payUrl(params) {
    const utility = require("utility"); //导入md5第三方库
    return new Promise((resolve, reject) => {
        var sPara = [];
        if (!params) return null;
        for (var key in params) {
            if ((!params[key]) || key == "sign" || key == "sign_type") {
                continue;
            };
            sPara.push([key, params[key]]);
        }
        sPara = sPara.sort();
        var prestr = '';
        for (var i2 = 0; i2 < sPara.length; i2++) {
            var obj = sPara[i2];
            if (i2 == sPara.length - 1) {
                prestr = prestr + obj[0] + '=' + obj[1] + '';
            } else {
                prestr = prestr + obj[0] + '=' + obj[1] + '&';
            }
        }
        let str = prestr;
        let keys = ""; //密钥,易支付注册会提供pid和秘钥

        //MD5加密--进行签名
        let sign = utility.md5(str + keys); //注意支付宝规定签名时:待签名字符串后要加key

        // 最后要将参数返回给前端，前端访问url发起支付
        let result = `http://pay.hackwl.cn/submit.php?${str}&sign=${sign}&sign_type=MD5`;
        resolve(result);

    })
}
module.exports = {
    payUrl,
    // pid
}