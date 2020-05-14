# nodejs写的一个接口

## 前言

出于好奇学了下nodeJs，然后用express写了个接口，没有路由，出于好奇，就随便写写，很乱并且很烂。。。，状态码返回的也很随意

## 功能

* 测试地址：[https://api.songjintao.cn](https://api.songjintao.cn)

* 我的博客：[https://songjintao.cn](https://songjintao.cn)

* 注册 jwt
* 用户名查重
* 登陆 token
* 搜索 
* 添加商品
* 删除商品
* 查看购物车商品
* 支付

## 注意

* 接口请求时大部分要加token 
* token会在登陆成功时生成
* 搜索接口返回的内容存在数据库中
* 注册时邮箱发送验证码需要自己配置邮箱信息
* 使用的支付接口需要密钥才能签名


## 使用

```
#安装依赖
npm install

#运行
node app.js
```