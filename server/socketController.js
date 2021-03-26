'use strict';
/* Class */
// const LobbyManager = require('./LobbyManager');
const RoomManager = require('./RoomManager');
// const MapManager = require('./MapManager');
console.log(RoomManager);
/* 서버로 오는 요청을 담당할 io 정의 */
module.exports = (io) => {
    console.log("io connect");
    /* connect 요청 시 */
    RoomManager.init(io);
    io.on('connect', (socket) => {
        socket.on('test', data => {
            socket.emit('test', 'hello');
        });

        socket.on('getUsers', (roomName, userName, characterNum) => {
            const room = RoomManager.getRoomByRoomName(roomName);
            socket.emit('sendUsers', room.getUserDatasForDraw());
            // console.log(roomName);
            // console.log(io);
            io.to(roomName).emit('addUser', socket.id, userName, characterNum);
            initSocket(socket, room, userName, characterNum);
            initWebRTC(socket, room);
            initKeyEvent(socket, room);
            initMusic(socket, room);
            initChat(socket, room);
            room.start(io);
        });
    });

    function initSocket(socket, room, username, characterNum){
        /* 방 이름이 없으면 */
        if (room === undefined){
            /* ERROR */
            console.log("ERROR : io.on('connect'), roomName === undefined");
        }
        /* 방 이름이 있으면 */
        else{
            /* Room에 socket 추가 */
            RoomManager.addSocketToRoom(socket, room, username, characterNum);
        }
        return room;
    }
    
    function initWebRTC(socket, room){
        /* WebRTC에 필요한 signal 교환 */
        socket.on('signal', data => {
            if(!room.users[data.socket_id].socket)return
            room.users[data.socket_id].socket.emit('signal', {
                socket_id: socket.id,
                signal: data.signal
            });
        });

        socket.on('disconnect', () => {          
            io.to(room.name).emit('removeUser', socket.id);
            console.log(socket.id);
            RoomManager.removeSocketFromRoom(socket);
        });
    }

    function initKeyEvent(socket, room){
        /* 키가 눌리는 이벤트 발생 시 */
        socket.on('keydown', function(keyCode) {
            if (room !== null && room !== undefined) {
                /* 해당 socket의 Keypress의 keyCode를 true로 설정 */
                room.users[socket.id].keyPress[keyCode] = true;
            }
        });
    
        /* 키가 올라가는 이벤트 발생 시 */
        socket.on('keyup', function (keyCode) {
            if (room !== null && room !== undefined) {
                /* 해당 socket의 Keypress의 keyCode를 false로 설정 */
                room.users[socket.id].keyPress[keyCode] = false;
            }
        });
    }
    
    function initMusic(socket, room){
        socket.on('music', () => {
            if (room.music === false){
                // console.log(`music_on!! ${roomManager.rooms[roomName].music}`);
                room.music = true;
                io.to(room.name).emit('music_on');
            }
            else {
                // console.log(`music_off!! ${roomManager.rooms[roomName].music}`);
                room.music = false;
                io.to(room.name).emit('music_off');
            }
        })
    }

    function initChat(socket, room) {
        socket.on('chat', (name, message) => {
            // console.log(name, message);
            socket.broadcast.to(room.name).emit('chat', name, message);
        });
    }
}

