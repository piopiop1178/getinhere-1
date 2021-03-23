'use strict';

/* Class */
// const LobbyManager = require('./LobbyManager');
const RoomManager = require('./RoomManager');
// const MapManager = require('./MapManager');

/* 서버로 오는 요청을 담당할 io 정의 */
module.exports = (io) => {
    /* connect 요청 시 */
    /* 테스트 용으로 임시 방 생성 */
    RoomManager.init(io);
    io.on('connect', (socket) => {
        /* socket에서 room의 값을 가져온다 */
        const roomName = socket.handshake.query.room;
        console.log(roomName);
        const room = RoomManager.getRoomByRoomName(roomName);
        console.log(room);
        initSocket(socket, room);

        /* Room 추가 후 Room 정보를 전달한다 */
        socket.emit('connected', room.map, room.name);
        socket.to(room.name).emit('initReceive', socket.id);

        initWebRTC(socket, room);
        initKeyEvent(socket, room);
        initMusic(socket, room);
        initChat(socket, room);

        socket.on('hello', () =>{
            console.log("socket on");
            socket.emit('hello');
        });

    });

    function initSocket(socket, room){
        /* 방 이름이 없으면 */
        if (room === undefined){
            /* ERROR */
            console.log("ERROR : io.on('connect'), roomName === undefined");
        }
        /* 방 이름이 있으면 */
        else{
            /* Room에 socket 추가 */
            RoomManager.addSocketToRoom(socket, room);
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
    
        /* 기존 Peer 들이 신규 Peer 추가했다는 응답을 받고
         * 신규 Peer에게 기존 Peer를 연결하라고 initSend 송신 */
        socket.on('initSend', init_socket_id => {
            room.users[init_socket_id].socket.emit('initSend', socket.id);
        });
    
        /* 소켓 연결 종료 */
        socket.on('disconnect', () => {          
            io.to(room.name).emit('removePeer', socket.id);
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

