const LobbyManager = require('./LobbyManager');
const MapManager = require('./MapManager'); //! 나중에 여기에 인자로 원하는 맵 number가 들어가면 된다. 그러면 MAP.js가 DB랑 통신해서 MAP정보를 받아온다
const { roomByName } = require('./RoomManager');
const RoomManager = require('./RoomManager');
const mediasoup = require('mediasoup');


/* DB에서 Map을 불러와서 미리 서버에 저장 */
MapManager.init();

/* 서버로 오는 요청을 담당할 io 정의 */
module.exports = async (io) => {
    /* connect 요청 시 */
    /* 테스트 용으로 임시 방 생성 */
    await RoomManager.init(io);
    const new_room = await RoomManager.createRoom(MapManager.getMapByIndex(0));

    io.on('connect', (socket) => {
        /* socket에서 room의 값을 가져온다 */
        const roomName = socket.handshake.query.room;
        const room = RoomManager.getRoomByRoomName(roomName);
        
        initSocket(socket, room);
        // socket.emit('joined');
        /* Room 추가 후 Room 정보를 전달한다 */
        socket.emit('connected', room.map, room.name);
        socket.to(room.name).emit('initReceive', socket.id);

        initWebRTC(socket, room);
        initKeyEvent(socket, room);
        initMusic(socket, room);
        initChat(socket, room);

    });

    async function initSocket(socket, room){
        /* 방 이름이 없으면 */
        if (room === undefined){
            /* ERROR */
            console.log("ERROR : io.on('connect'), roomName === undefined");
        }
        /* 방 이름이 있으면 */
        else{
            /* Room에 socket 추가 */
            await RoomManager.addSocketToRoom(socket, room);
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

        socket.on('getRouterRtpCapabilities', (data, callback) => {
            let router = RoomManager.getRouterBySocket(socket);
            // callback(router.rtpCapabilites);
            callback(router);
        });
        
        socket.on('createTransport', async (data, callback) => {
            try {
              const { transport, params } = await createWebRtcTransport();
              room.roomState.transports[data.transport.id] = transport;
              callback(params);
            } catch (err) {
              console.error(err);
              callback({ error: err.message });
            }
          });
        
        socket.on('connectTransport', async (data, callback) => {
            const transport = room.roomState.transports[data.transportId];
            await transport.connect({ dtlsParameters: data.dtlsParameters });
            callback();
        });

        socket.on('produce', async (data, callback) => {
            const {kind, rtpParameters} = data;
            const transport = room.roomState.transports[data.transportId];
            const peerId = socket.id;
            producer = await transport.produce({ kind, rtpParameters, appData: { peerId, transportId } });
            callback({ id: producer.id });
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

