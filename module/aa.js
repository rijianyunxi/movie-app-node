






// let arr = [random, timestamp]
// let queryres = await query('insert into code (id,code,date) values (id,?,?)', arr);

if (info.response == "250 OK: queued as." && queryres == "success") {
    let result = {
        messageId: info.messageId,
        reponse: info.response,
        queryres: queryres
    }
    console.log(result)
    callback(result, error);
}
else {
    let error = {
        queryres,
        info
    }
    callback(result, error);
}



let info = await message.sendMail({
    from: "691736657@qq.com",
    to: email,
    subject: "感谢你使用Movie",
    text: `你的验证码是${random},验证码有效期为10分钟,打死都不要把验证码给别人哦【Movie】`,
});