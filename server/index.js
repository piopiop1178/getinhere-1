require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const app2 = express();
const mongoose = require('mongoose')

const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

mongoose.connect(process.env.MONGO_URI, 
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

require('./routes')(app)

const httpsServer = https.createServer(options, app).listen(443);

app2.use(function(req, res, next){
    res.redirect("https://" + req.headers['host'] + req.url)
});

const httpServer = http.createServer(app2).listen(80);

const io = require('socket.io')(httpsServer)

require('./socketController')(io)
