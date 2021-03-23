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


    /* 방 생성 API 설정 */
    const RoomManager = require('./RoomManager');
    const MapManager = require('./MapManager');
    const CharacterManager = require('./CharacterManager');

    app.get('/api/mapList', (req, res) => {
        const mapList = MapManager.getMapList();
        return res.status(200).json({
            "mapList": mapList,
            "success": true,
        }); 
    });

    app.get('/api/mapIndex', (req, res) => {
        console.log(`/api/mapIndex ${req.query}`);
        const mapIndex = req.query.mapIndex;
        const map = MapManager.getMapByIndex(mapIndex);
        const roomName = RoomManager.createRoom(map);
        return res.status(200).json({
            "roomName": roomName,
            "map": map,
            "success": true,
        }); 
    });

    app.get('/api/preset', (req, res) => {
        // console.log(req);
        // console.log(req.query.mapIndex);
        res.send(req.query);
    });




    // app.set('view engine', 'ejs');
    // app.engine('html', require('ejs'.renderFile));

    // app.get('/room', (req, res) => {
    //     const data = await fs.readFile('../client/room.html');
    //     res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    //     return res.end(data);
    // });
    
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