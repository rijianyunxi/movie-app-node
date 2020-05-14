const nodemailer = require("nodemailer");

let message = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false,
    auth: {
        user: '691736657@qq.com',
        pass: '你的邮箱授权码，不是密码'
    }
});

function randoms(length) {
    let random = '';
    for (let i = 0; i < length; i++) {
        random += Math.floor(Math.random() * 10);
    }
    return random
}

let timestamp = new Date().getTime()




module.exports = {
    nodemailer,
    message,
    randoms,
    timestamp,

};