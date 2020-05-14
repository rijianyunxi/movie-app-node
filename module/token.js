const jwt = require('jsonwebtoken');

function TOKEN() {

}

TOKEN.prototype.sign = function (str, SERCET) {
    let token = jwt.sign({ userId: str }, SERCET, { expiresIn: '7d' });
    return token
}

TOKEN.prototype.verify = function (token, SERCET) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SERCET, (err, decode) => {
            if (err) {
                reject('token错误');
            } else {
                resolve(decode)
            }
        });
    })

}

module.exports = TOKEN;