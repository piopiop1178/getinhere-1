const path = require('path')
const express = require('express')

module.exports = (app) => {

    // redirect http traffic to https traffic
    /*app.use('*', (req, res, next) => {
        if(!req.socket.encrypted){
            console.log('unsecure connection: redirecting..')
            res.redirect('https://' + req.headers.host + req.path)
        } else {
            next()
        }
    })*/

    app.use(express.static(path.join(__dirname, '..','client'))) //  여기서 알아서 index.html 찾아가나? 아무것도 안쓰면 index.html찾아간다
    app.use(express.static(path.join(__dirname, '..','node_modules')))
}