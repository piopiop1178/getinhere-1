'use strict';

/* 서버 실행에 필요한 node module require */
// const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
// const app2 = express();
//! redis
const cluster = require("cluster");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
// const { setupMaster, setupWorker } = require("@socket.io/sticky"); //! npm install @socket.io/sticky
const redisAdapter = require("socket.io-redis"); //! 신규설치


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


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    // const httpsServer = https.createServer(options, app).listen(process.env.NODE_PORT);
    // // const httpsServer = https.createServer(options, app);
    // setupMaster(httpsServer, {
    //     // loadBalancingMethod: "random", // either "random", "round-robin" or "least-connection"
    //     // loadBalancingMethod: "round-robin", // either "random", "round-robin" or "least-connection"
    //     loadBalancingMethod: "round-robin", // either "random", "round-robin" or "least-connection"
    // });

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
    
    // const io = new Server(httpsServer, {
    //     cors: {
    //         origin: "*",
    //         method: ["GET", "POST"]
    //     },
    //     transports: [ "websocket" ] //! 맞나?
    // });
    // io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
    // // setupWorker(io);
    // require('./socketController')(io);

} else {
    console.log(`Worker ${process.pid} started`);
    // const httpsServer = https.createServer(options, app);
    const httpsServer = https.createServer(options, app).listen(process.env.NODE_PORT);
    const io = new Server(httpsServer, {
        cors: {
            origin: "*",
            method: ["GET", "POST"]
        },
        // transports: [ "websocket" ] //! 맞나?
    });
    io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
    // setupWorker(io);
    require('./socketController')(io);
}
