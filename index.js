const https = require('https');

const fs = require('fs');
const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
};

https.createServer(options, function (req, res) {
    res.end('Listening on 443');
}).listen(443);

const http = require('http');

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);