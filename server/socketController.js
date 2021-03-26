const LobbyManager = require('./LobbyManager');
const MapManager = require('./MapManager'); //! 나중에 여기에 인자로 원하는 맵 number가 들어가면 된다. 그러면 MAP.js가 DB랑 통신해서 MAP정보를 받아온다
const { roomByName } = require('./RoomManager');
const RoomManager = require('./RoomManager');
const mediasoup = require('mediasoup');
const config = require('../config');

/* DB에서 Map을 불러와서 미리 서버에 저장 */
MapManager.init();

/* 서버로 오는 요청을 담당할 io 정의 */
module.exports = async (io) => {
    /* connect 요청 시 */
    /* 테스트 용으로 임시 방 생성 */
    await RoomManager.init(io);
    const new_room = await RoomManager.createRoom(MapManager.getMapByIndex(0));

    io.on('connect', (socket) => {
        console.log(`socket connect !! ${socket.id}`)
        /* socket에서 room의 값을 가져온다 */
        const roomName = socket.handshake.query.room;
        const room = RoomManager.getRoomByRoomName(roomName);
        
        initSocket(socket, room);
        // socket.emit('joined');
        /* Room 추가 후 Room 정보를 전달한다 */
        socket.on('initDone', ()=> {
            socket.emit('connected', room.map, room.name);
        })
        
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
        /* 기존 Peer 들이 신규 Peer 추가했다는 응답을 받고
         * 신규 Peer에게 기존 Peer를 연결하라고 initSend 송신 */
        socket.on('initSend', init_socket_id => {
            room.users[init_socket_id].socket.emit('initSend', socket.id);
        });
    
        /* 소켓 연결 종료 */
        socket.on('disconnect', async(reason) => {
            console.log(`socket disconnected!: ${socket.id}`);
            console.log(reason)
            let target_transport = Object.values(room.roomState.transports).find(
                (p) => p.appData.socket_id === socket.id);
            await closeTransport(room.roomState, target_transport)
            target_transport = Object.values(room.roomState.transports).find(
                (p) => p.appData.socket_id === socket.id);
            await closeTransport(room.roomState, target_transport)    
            
            // let producer = await room.roomState.producers.find(
            //     (p) => p.appData.mediaTag === data.mediaTag &&
            //            p.appData.peerId === data.peerId
            //   );

            io.to(room.name).emit('removePeer', socket.id);
            RoomManager.removeSocketFromRoom(socket);
        });

        socket.on('getRouterRtpCapabilities', (data, callback) => {
            let router = RoomManager.getRouterBySocket(socket);
            callback(router);
        });
        
        socket.on('createTransport', async (data, callback) => {
            let router = RoomManager.getRouterBySocket(socket);
            try {
              const { transport, params } = await createWebRtcTransport(router, socket);
              room.roomState.transports[transport.id] = transport;
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
            const {kind, rtpParameters, appData } = data;
            const transport = room.roomState.transports[data.transportId];
            const peerId = socket.id;
            const transportId = data.transportId;
            const { mediaTag } = appData;
            let producer = await transport.produce({ kind, rtpParameters, appData: { peerId, transportId, mediaTag} });

            producer.on('transportclose', () => {
                // console.log('producer\'s transport closed', producer.id);
                closeProducer(room.roomState, producer);
            });
            
            room.roomState.producers.push(producer);

            if (mediaTag === 'cam-audio')
                socket.to(room.name).emit('initReceive', socket.id);
            callback({ id: producer.id });
        });

        socket.on('consume', async (data, callback) => {
            //여기서 consumer 찾기 -> 그러려면 metadata 넘겨줘야됨 
            const transport = room.roomState.transports[data.transportId];
            const router = RoomManager.getRouterBySocket(socket);
            let producer = await room.roomState.producers.find(
                (p) => p.appData.mediaTag === data.mediaTag &&
                       p.appData.peerId === data.peerId
              );
            const roomState = room.roomState;
            callback(await createConsumer(router, transport, roomState, producer, data.rtpCapabilities));
          });

        socket.on('resumeConsumer', async (data, callback) => {
            let { consumerId } = data,
                consumer = room.roomState.consumers.find((c) => c.id === consumerId);

            await consumer.resume();
            callback();
        });

        socket.on('closeTransport', async (data, callback) => {
            let roomState = room.roomState
            try {
                let { transportId } = data,
                    transport = roomState.transports[transportId];
                console.log('closeTransport!!!')
                if (!transport) {
                    console.error(`close-transport: server-side transport ${transportId} not found`);
                    return;
                }
            
                await closeTransport(roomState, transport);
                callback()
            } catch (e) {
                console.error('error in /signaling/close-transport', e);
            }
        })

        socket.on('closeConsumer', async (data, callback) => {
          let roomState = room.roomState;
          try {
            let { consumerId } = data,
                consumer = roomState.consumers.find((c) => c.id === consumerId);

              if (!consumer) {
                console.error(`close-consumer: server-side consumer ${consumerId} not found`);
                return;
              }
          
              await closeConsumer(roomState, consumer);
              callback()
            } catch (e) {
              console.error('error in /signaling/close-consumer', e);
            }
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
                room.music = true;
                io.to(room.name).emit('music_on');
            }
            else {
                room.music = false;
                io.to(room.name).emit('music_off');
            }
        })
    }

    function initChat(socket, room) {
        socket.on('chat', (name, message) => {
            socket.broadcast.to(room.name).emit('chat', name, message);
        });
    }
}

async function createWebRtcTransport(router, socket) {
    const {
      maxIncomingBitrate,
      initialAvailableOutgoingBitrate
    } = config.mediasoup.webRtcTransport;
    const transport = await router.createWebRtcTransport({
      listenIps: config.mediasoup.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      appData: {socket_id: socket.id},
      initialAvailableOutgoingBitrate,
    });
    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) {
      }
    }
    return {
      transport,
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      },
    };
  }

async function createConsumer(router, transport, roomState, producer, rtpCapabilities) {
    let consumer;
    if (!router.canConsume(
        {
            producerId: producer.id,
            rtpCapabilities,
        })
    ) {
        console.error('can not consume');
        return;
    }
    try {
        consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true,
            // paused: producer.kind === 'video',
        });

        // need both 'transportclose' and 'producerclose' event handlers,
        // to make sure we close and clean up consumers in all
        // circumstances
        consumer.on('transportclose', () => {
            console.log(`consumer's transport closed`, consumer.id);
            closeConsumer(roomState, consumer);
        });
        consumer.on('producerclose', () => {
            console.log(`consumer's producer closed`, consumer.id);
            closeConsumer(roomState, consumer);
        });

        roomState.consumers.push(consumer);
    } catch (error) {
        console.error('consume failed', error);
        return;
    }
  
    if (consumer.type === 'simulcast') {
        console.log('simulcast!!')
        // await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
    }
  
    return {
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused
    };
}

async function closeTransport(roomState, transport) {
    try {

        // our producer and consumer event handlers will take care of
        // calling closeProducer() and closeConsumer() on all the producers
        // and consumers associated with this transport
        await transport.close();

        // so all we need to do, after we call transport.close(), is update
        // our roomState data structure
        delete roomState.transports[transport.id];
    } catch (e) {
        console.error(e);
    }
}

async function closeProducer(roomState, producer) {
    try {
        await producer.close();
  
        // remove this producer from our roomState.producers list
        roomState.producers = roomState.producers
            .filter((p) => p.id !== producer.id);
  
        // remove this track's info from our roomState...mediaTag bookkeeping
        // if (roomState.peers[producer.appData.peerId]) {
        //     delete (roomState.peers[producer.appData.peerId]
        //         .media[producer.appData.mediaTag]);
        // }
    } catch (e) {
        console.error(e);
    }
}

async function closeConsumer(roomState, consumer) {
  await consumer.close();

  // remove this consumer from our roomState.consumers list
  roomState.consumers = roomState.consumers.filter((c) => c.id !== consumer.id);

  // remove layer info from from our roomState...consumerLayers bookkeeping
  // if (roomState.peers[consumer.appData.peerId]) {
  //   delete roomState.peers[consumer.appData.peerId].consumerLayers[consumer.id];
  // }
}
