'use strict';

const uuid = require('uuid');
const Room = require('./Class/Room');
const User = require('./Class/User');
const config = require('../config');
const mediasoup = require('mediasoup');

class RoomManager {   // Room 함수 실행
    static roomByName = {};
    static roomByUser = {};
    static io = undefined;
    static workers = [];

    constructor() {
    }

    static init(io){
        this.io = io;
    }

    /* 새로운 Room을 생성 */
    static createRoom(map){
        // console.log("createRoom");
        // console.log(map);
        /* uuid 로 roomName 생성 */
        const tokens = uuid.v4().split('-');
        const roomName = tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
        console.log("********** createRoom ***********");
        console.log(`localhost?room=${roomName}`);
        /* roomName으로 새로운 Room을 생성하여 rooms에 추가 */
        const room = new Room(roomName, map);
        this.roomByName[roomName] = room;
        return roomName;
    }

    /* 전달받은 socket으로 User를 생성하여 roomName에 해당하는 Room에 User를 추가 */
    static addSocketToRoom(socket, room, username, characterNum){
        const user = new User(socket, username, characterNum);
        /* Room에 User 추가 */
        room.addUser(user);
        /* users 배열에 user.socket.id를 key로 하는 value 값을 roomName으로 설정*/
        this.roomByUser[user.socket.id] = room;
        /* user를 roomName에 해당하는 Room 추가 */
        socket.join(room.name);
        if (room.memberCount === 1){
            // room.start(this.io);
        }
    }

    /* Room에서 User를 제거 */
    static removeSocketFromRoom(socket){
        /* */
        const room = this.roomByUser[socket.id];
        if (room === undefined){
            console.log("ERROR : removeUserFromRoom, roomName === undefined");
            return;
        }
        // socket.leave(room.name);
        room.removeUser(socket);
        delete this.roomByUser[socket.id];
        
        if(room.isEmpty()){
            this.deleteRoom(room);
        }
    }

    static deleteRoom(room){
        delete this.roomByName[room.name];
    }

    static getSocketsByRoomName(roomName){
        return this.roomByName[roomName].getSockets();
    }

    static getRoomBySocket(socket){
        return this.roomByUser[socket.id];
    }

    static getRoomByRoomName(roomName){
        return this.roomByName[roomName];
    }

    static getRoomNameBySocket(socket){
        return this.roomByUser[socket.id].name;
    }
}

module.exports = RoomManager;
