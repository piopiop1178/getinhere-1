const https = require('https');
const fs = require('fs');
const path = require('path')
const express = require('express')
const app = express()

const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

const httpsServer = https.createServer(options, app).listen(443);

const http = require('http');

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
}).listen(80);

require('./routes')(app)

const io = require('socket.io')(httpsServer)

console.log('is in!');

require('./socketController')(io)
