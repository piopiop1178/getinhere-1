module.exports = (io) => {

    let GAME_SETTINGS = new (require('./MapManager.js'))(); //! 나중에 여기에 인자로 원하는 맵 number가 들어가면 된다. 그러면 MAP.js가 DB랑 통신해서 MAP정보를 받아온다
    const lobbyManager = new (require('../client/js/LobbyManager.js'))(io);
    const roomManager = new (require('../client/js/RoomManager.js'))(io, GAME_SETTINGS);
    
    io.on('connect', (socket) => { //This event is fired upon a new connection. The first argument is a Scocket instance.
        console.log('user connected: ', socket.id);
        console.log(io.sockets.adapter.rooms);
        // Initiate the connection process as soon as the client connects
        
        lobbyManager.push(socket); // 없애도 됨 -> 바꿀 때 kick등도 같이 바꾸기
        lobbyManager.dispatch(roomManager);

        // console.log(io.sockets.adapter.rooms);

        let roomName = roomManager.findRoomName(socket);
        let peers = roomManager.rooms[roomName].players;

        socket.emit('connected', GAME_SETTINGS, roomName);
        // Asking all other clients to setup the peer connection receiver
        socket.to(roomName).emit('initReceive', socket.id)
        
        socket.on('signal', data => {
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.id,
                signal: data.signal
            })
        })

        socket.on('disconnect', () => {          
            let roomName = roomManager.findRoomName(socket);
            io.to(roomName).emit('removePeer', socket.id)
              
            roomManager.disconnect(socket);
            lobbyManager.kick(socket);
            
            console.log('socket disconnected ' + socket.id)
            delete peers[socket.id]
        })

        socket.on('initSend', init_socket_id => {
            console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
            peers[init_socket_id].emit('initSend', socket.id)
        })

        socket.on('keydown', function(keyCode) {
            let roomName = roomManager.findRoomName(socket);
            if (roomName !== null) {
                roomManager.rooms[roomName].objects[socket.id].keypress[keyCode] = true;
            }
        });

        socket.on('keyup', function (keyCode) {
            let roomName = roomManager.findRoomName(socket);
            if (roomName !== null) {
                // roomManager.rooms[roomName].objects[socket.id].keypress[keyCode] = false;
                delete roomManager.rooms[roomName].objects[socket.id].keypress[keyCode];
            }
        });

        socket.on('music', () => {
            io.to(roomName).emit('music');
        })
    })
}
