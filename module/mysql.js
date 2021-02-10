const mysql = require('mysql');

let con = mysql.createConnection({
    host: '47.94.174.190',
    user: 'songjintao',
    password: '123456',
    database: 'songjintao'
})

con.connect((err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("数据库连接成功")
    }
});

function query(str,arr,res){
    return new Promise((resolve,reject)=>{
        con.query(str,arr,(err,result,Fields)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}

module.exports = query;