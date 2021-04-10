'use strict';

const path = require('path')
const express = require('express')
const cors = require('cors');

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

    app.get('/api/mapIndex', async (req, res) => {
        const mapIndex = req.query.mapIndex;
        const map = MapManager.getMapByIndex(mapIndex);
        const roomName = await RoomManager.createRoom(map); // getin 버튼을 누르면 createRoom을 하게된다
        return res.status(200).json({
            "roomName": roomName,
            "success": true,
        }); 
    });

    app.get('/api/map', (req, res) => {
        // console.log(`/api/mapIndex ${req.query}`);
        // console.log(req.query);
        const roomName = req.query.roomName;
        const map = RoomManager.getRoomByRoomName(roomName).map;
        return res.status(200).json({
            "map": map,
            "success": true,
        }); 
    });

    app.get('/api/characterList', (req, res) => {
        const characterList = CharacterManager.getCharacterList();
        return res.status(200).json({
            "characterList": characterList,
            "success": true,
        }); 
    });

    app.get('/api/preset', (req, res) => {
        // console.log(req.query.userName);
        // console.log(req.query.characterNum);
        return res.status(200).json({
            "success": true,
        }); 
    });

    app.get('/api/usersCount', (req, res) => {
        const roomName = req.query.roomName;
        const room = RoomManager.getRoomByRoomName(roomName);
        let usersCount = -1;
        let success = false;
        if(room !== undefined){
            usersCount = Object.keys(room.users).length;
            success = true;
        }
        return res.status(200).json({
            "usersCount": usersCount,
            "success": success,
        });
    });

    app.get('/api/checkRoomName', (req, res) => {
        const roomName = req.query.roomName;
        const room = RoomManager.getRoomByRoomName(roomName)
        return res.status(200).json({
            "room": room ? room.name : undefined,
            "success": true,
        });
    });
}