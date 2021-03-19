/* 필요한 node module require */
require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const app2 = express();
const mongoose = require('mongoose')

/* https 서버 생성을 위한 키 파일 설정 */
const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

/* MONGO DB 연결, .env 파일에서 MONGO_URI 정보 확인 */
// mongoose.connect(process.env.MONGO_URI, 
// {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
// ).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

/* https 서버 생성에 사용할 app에 route.js 파일을 통해 경로 설정 */
require('./routes')(app)

/* 443 포트로 listen 하는 https 서버 생성 */
const httpsServer = https.createServer(options, app).listen(443);

/* http 서버 생성에 사용할 app2에 미들웨어 함수를 설정하여 https로 리다이렉트 */
app2.use(function(req, res, next){
    res.redirect("https://" + req.headers['host'] + req.url)
});

/* 80 포트로 listen 하는 http 서버 생성 */
const httpServer = http.createServer(app2).listen(80);

/* https 서버로 오는 요청을 처리할 socket 생성 */
const io = require('socket.io')(httpsServer)

/* https 서버로 오는 요청에 대해 소켓이 처리할 내용을 설정 */
require('./socketController')(io)
