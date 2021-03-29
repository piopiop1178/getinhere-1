'use strict';

/* 서버 실행에 필요한 node module require */
// const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
// const app2 = express();

require('dotenv').config();
const mongoose = require('mongoose');

/* MONGO DB 연결, .env 파일에서 MONGO_URI 정보 확인 */
mongoose.connect(process.env.MONGO_URI, 
    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
    ).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

/* 서버에 필요한 자원을 미리 업로드 */
const MapManager = require('./MapManager');
const CharacterManager = require('./CharacterManager');

MapManager.init();
CharacterManager.init();

/* https 서버 생성을 위한 키 파일 설정 */
const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

/* https 서버 생성에 사용할 app에 route.js 파일을 통해 경로 설정 */
require('./routes')(app)

/* https 서버 생성 */
const httpsServer = https.createServer(options, app).listen(process.env.NODE_PORT);

/* https 서버로 오는 요청을 처리할 socket 생성 */
const io = require('socket.io')(httpsServer , {
    cors: {
        origin: "*",
        method: ["GET", "POST"]
    },
    // extraHeaders: {
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Headers": "X-Requested-With",
    //     "Accept": "application/json"
    // }
});

/* https 서버로 오는 요청에 대해 소켓이 처리할 내용을 설정 */
require('./socketController')(io);
