const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const app2 = express();

const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

require('./routes')(app)

const httpsServer = https.createServer(options, app).listen(443);


app2.use(function(req, res, next){
    res.redirect("https://" + req.headers['host'] + req.url)
});

const httpServer = http.createServer(app2).listen(80);

// http.createServer(function (req, res) {
//     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
// }).listen(80);

const io = require('socket.io')(httpsServer)

require('./socketController')(io)