'use strict';
/* Class */
// const LobbyManager = require('./LobbyManager');
const RoomManager = require('./RoomManager');
// const MapManager = require('./MapManager');
/* 서버로 오는 요청을 담당할 io 정의 */
module.exports = (io) => {
    console.log("io connect");
    /* connect 요청 시 */
    /* 테스트 용으로 임시 방 생성 */
    RoomManager.init(io);
    io.on('connect', (socket) => {
        // const roomName = socket.handshake.query
        // console.log(socket)
        socket.on('hello', data => {
            console.log(data);
        });
        socket.emit('hello', 'hello');
    });
}