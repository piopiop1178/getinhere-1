'use strict';

const path = require('path')
const express = require('express')
const cors = require('cors');
// const fs = require('fs');

module.exports = async (app) => {
    /* express에 저장된 body parser 사용 */
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(cors());

    app.use(express.static(path.join(__dirname, '..','client')));
    app.use(express.static(path.join(__dirname, '..','node_modules')));

    app.get('/api/hello', (req, res) => {
        console.log(req);
        res.send("안녕하세요 ~ ");
    });

    // app.set('view engine', 'ejs');
    // app.engine('html', require('ejs'.renderFile));

    // app.get('/room', (req, res) => {
    //     const data = await fs.readFile('../client/room.html');
    //     res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    //     return res.end(data);
    // });
    
    /* 방 생성 API 설정 */
    const RoomManager = require('./RoomManager');
    const MapManager = require('./MapManager');
    const CharacterManager = require('./CharacterManager');

    app.post('/room', (req, res) => {
        const mapNumber = req.body.map_number;
        const roomName = RoomManager.createRoom(MapManager.getMapByIndex(mapNumber));
        return res.status(200).json({
            "roomURL": `https://localhost/room.html?room=${roomName}`,
            "success": true,
        }); 
    });

    app.post('/character', (req, res) => {
        const characterNumber = req.body.character_number;
        const characterPath = CharacterManager.getCharacterByIndex(characterNumber);
        return res.status(200).json({
            "characterPath": characterPath.SOURCE_PATH,
            "success": true,
        }); 
    });
}