'use strict';

/* Class */
// const LobbyManager = require('./LobbyManager');
const RoomManager = require('./RoomManager');
// const MapManager = require('./MapManager');
const mediasoup = require('mediasoup');
const config = require('../config');

/* 서버로 오는 요청을 담당할 io 정의 */
module.exports = (io) => {
    /* connect 요청 시 */
    RoomManager.init(io);
    io.on('connect', (socket) => {
        let room;
        /* MainPage 접속 시 initSocket 수신 */
        socket.on('initSocket', (roomName) => {
          // console.log('initSocket');
          room = RoomManager.getRoomByRoomName(roomName);

          /* 기능 별 socket on 설정 */
          initWebRTC(socket, room);
          initKeyEvent(socket, room);
          initMusic(socket, room);
          initChat(socket, room);
          initAlcholIcon(socket, room);
          initObject(socket, room);
          initSpaceChange(socket, room);
          initMafiaGame(socket, room);
        });

        socket.on('ready', async (roomName, userName, characterNum) => {
          // console.log('ready');
          room = RoomManager.getRoomByRoomName(roomName)
          if (room === undefined){
            console.log("ERROR : io.on('connect'), room === undefined");
            return;
          }
          socket.emit('sendUsers', room.getUserDatasForDraw());
          await RoomManager.addSocketToRoom(socket, room, userName, characterNum);
        });

        /* 신규 user가 준비가 끝나고 시작하면 기존 user들에게 신규 user 추가 알림 */
        socket.on('start', (roomName, userName, characterNum, space) => {
          room = RoomManager.getRoomByRoomName(roomName)
          const users = room.users; 
          for(let socketId in users){
            if(socketId !== socket.id){
              users[socketId].socket.emit('addUser', socket.id, userName, characterNum, space);
            } 
            // console.log(socketId);
            // let user = this.users[socketId];
            // userDatas[socketId] = {userName: user.userName, characterNum: user.characterNum}
          }
          // socket.broadcast.to('roomName').emit('addUser', socket.id, userName, characterNum);
          // io.to(roomName).emit('addUser', socket.id, userName, characterNum);
        });
    });
    
    function initWebRTC(socket, room){
        socket.on('getRouterRtpCapabilities', (data, callback) => {
            // console.log('getRouterRtpCapabilities');
            let router = RoomManager.getRouterBySocket(socket);
            // console.log(`router: ${router}`)
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
            room.roomState.producers.push(producer);
            producer.on('transportclose', () => {
                closeProducer(room.roomState, producer);
            });

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
            // console.log(roomState);
            callback(await createConsumer(router, transport, roomState, producer, data.rtpCapabilities, data.mediaTag));
          });

        socket.on('resumeConsumer', async (data, callback) => {
            let { consumerId, mediaTag } = data,
                consumer = room.roomState.consumers.find((c) => c.id === consumerId );
            await consumer.resume();
            callback();
        });

        socket.on('pauseConsumer', async (data, callback) => {
          let { consumerId, mediaTag } = data,
              consumer = room.roomState.consumers.find((c) => c.id === consumerId );
            await consumer.pause();
            callback();
        })

        socket.on('resumeProducer', async (data, callback) => {
          let { producerId, mediaTag } = data,
              producer = room.roomState.producers.find((p) => p.id === producerId );

          await producer.resume();
          callback();
      });

      socket.on('pauseProducer', async (data, callback) => {
          let { producerId, mediaTag } = data,
              producer = room.roomState.producers.find((p) => p.id === producerId );
          await producer.pause();
          callback();
      })

      socket.on('closeProducer', async (data, callback) => {
        let roomState = room.roomState;
            try {
                let { producerId } = data,
                    producer = roomState.producers.find((p) => p.id === producerId);
  
                if (!producer) {
                  console.error(`close-producer: server-side producer ${producerId} not found`);
                  return;
                }
            
                await closeProducer(roomState, producer);
                callback()
            } catch (e) {
                console.error('error in /signaling/close-producer', e);
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

        socket.on('screenShare', (audio) => {
          //if audio set screenShare 2 / if not set screenShare 1
          room.users[socket.id].screenShare = audio ? 2 : 1;
          socket.to(room.name).emit('createScreenShareConsumer', socket.id, audio);
          // socket.emit('createScreenShareConsumer', socket.id);
        });

        socket.on('endScreenShare-signal', (audio) => {
          socket.to(room.name).emit('endScreenShare', socket.id, audio);
          room.users[socket.id].screenShare = 0;
        });

        socket.on('disconnect', async () => {          
          let target_transport = Object.values(room.roomState.transports).find(
              (p) => p.appData.socket_id === socket.id);
          await closeTransport(room.roomState, target_transport)
          target_transport = Object.values(room.roomState.transports).find(
              (p) => p.appData.socket_id === socket.id);
          await closeTransport(room.roomState, target_transport) 
          // console.log('disconnect!');
          io.to(room.name).emit('removeUser', socket.id);
          RoomManager.removeSocketFromRoom(socket, room.name);
        });
        // console.log("initWebRTC End");
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

        /* Keypress event to test socket disconnect */
        socket.on('testSocketDisconnect', () => {
            socket.disconnect()
        })
        // console.log("initKeyEvent End");
    }
    
    function initMusic(socket, room){
        socket.on('music', (video_id) => {
            if (room.music === false){
                room.music = true;
                io.to(room.name).emit('music_on', video_id);
            }
            else {  //210330기준 미사용
                room.music = false;
                io.to(room.name).emit('music_off');
            }
        })
        // console.log("initMusic End");
    }

    function initChat(socket, room) {
        socket.on('chat', (name, message) => {
            // console.log(name, message);
            socket.broadcast.to(room.name).emit('chat', name, message);
        });
        // console.log("initChat End");
    }

        /* 캐릭터 술 캔버스 설정 */
    function initAlcholIcon(socket, room) {
        socket.on('alchol-icon', (data) => {
            room.users[socket.id].status.alchol = !room.users[socket.id].status.alchol ? data : false
        })
    }

    function initObject(socket, room){
        socket.on('youtube', () => {
            if (room.video === false){
                room.video = true;
                io.to(room.name).emit('youtube_on');
            }
            else {
                room.video = false;
                io.to(room.name).emit('youtube_off');
            }
        })
        socket.on('video', (video_id) =>{
            io.to(room.name).emit('video_on', video_id);
        })
      
    }

    function initSpaceChange(socket, room) {
        socket.on('spaceChange', (oldSpace, newSpace) => {
            room.users[socket.id].status.space = newSpace
            let myScreenShareFlag = room.users[socket.id].screenShare

            Object.values(room.users).forEach((user) => {
                /* Need to be changed to send emit with list of changed users */
                let userScreenShareFlag = user.screenShare;
                if (user.status.space === oldSpace) {
                    user.socket.emit('removeOutUser', socket.id, myScreenShareFlag)
                    socket.emit('removeOutUser', user.socket.id, userScreenShareFlag)
                }
                else if (user.status.space === newSpace && user.socket.id != socket.id) {
                    user.socket.emit('addInUser', socket.id, myScreenShareFlag)
                    socket.emit('addInUser', user.socket.id, userScreenShareFlag)
                }
            })
        })
    }

    function initMafiaGame(socket, room) {
      /* MG-03. 클라이언트에서 마피아 게임 시작 이벤트를 받는다 */ 
      socket.on("joinMafiaGame", () => {
        this.joinMafiaGame(socket, room);
      });
    }

    function joinMafiaGame(socket, room) {
      /* MG-04. 기존 플레이어들에게 신규 플레이어를 추가하라고 알린다 */
      const players = room.mafiaGame.players;
      for (let socketId in players){
        players[socketId].socket.emit("addNewPlayer", socket.id);
      }
      /* MG-05. 마피아 게임에 신규 플레이어를 추가한다 */
      room.addPlayerToMafiaGame(socket);
      /* MG-06. 마피아 게임 플레이어 목록을 신규 플레이어에게 전달한다 */
      socket.emit("sendCurrentPlayers", players);
      /* MG-09. 게임 시작 이벤트를 수신하여 게임 세팅을 하고 시작신호 전달*/
      socket.on('startMafiaGame', () => {
        /* 역할 랜덤 추첨 및 전달 */
        room.mafiaGame.raffleRoles();
        room.mafiaGame.turnStart(10000); // 실제 게임은 120000, 테스트 용으로 10000
      });

      /* MG-12. 투표 턴에서 선택한 플레이어와 선택된 플레이어 정보를 게임에 저장 */
      /* MG-22. Night 턴에서 각 역할군이 지정한 후보 저장 */
      socket.on("sendCandidate", (candidateSocketId) => {
        /* 선택한 플레이어, 선택된 플레이어 MafiaGame 객체에 저장 및 같은 직업에게 공유 */
        room.mafiaGame.selectCandidate(socket.id, candidateSocketId);
      });

      /* MG-14. 투표 턴에서 후보 선택 확정 신호 수신 */
      /* MG-24. Night 턴에서 후보 선택 확정 신호 수신 */
      socket.on("confirmCandidate", () => {
        /* 마피아 게임 객체에서 플레이어 선택 확정 정보 Update */
        let result = room.mafiaGame.confirmCandidate();
        /* !!!! 이건 안에서 해야할 듯*/
        if(result !== undefined){
          socket.emit("sendVoteResult");
        }
      });

      /* MG-17. 생사 투표 확인 및 결과 전달 */
      socket.on("sendLiveOrDie", (liveOrDie) => {
        /* TODO: 생사 투표 결과 Update 
        * 완료되면 결과 전달 socket.emit("confirmLiveOrDie");
        * 게임 종료 여부 확인 */
        room.mafiaGame.checkLiveOrDie(socket.id, liveOrDie);
      });

      /* MG-19. Night 턴 */
      socket.on("startNight", () => {
        /* TODO: 각 역할 별로 동작 수행 요청
         * 시민 : 동작 없음
         * 마피아 : 제외할 시민 선택
         * 경찰 : 플레이어 1인 마피아 여부 확인
         * 의사 : 마피아 지목을 무효로 할 시민 선택 */
        socket.emit("doAction");
      });
    }

    function dayTurn(){

    }

    // 유저 수가 0일 때
    function endMafiaGame(socket){
      // socket.off();
    }
}

/* 추가된 코드 */

async function createWebRtcTransport(router, socket) {
  const {
    // maxIncomingBitrate,
    initialAvailableOutgoingBitrate
  } = config.mediasoup.webRtcTransport;

  const transport = await router.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransport.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: { socket_id: socket.id },
    initialAvailableOutgoingBitrate,
  });
  // if (maxIncomingBitrate) {
  //   try {
  //     await transport.setMaxIncomingBitrate(maxIncomingBitrate);
  //   } catch (error) {
  //   }
  // }
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

async function createConsumer(router, transport, roomState, producer, rtpCapabilities, mediaTag) {
  let consumer;
  if (!producer || !transport) {
    return;
  }

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
      appData: { mediaTag: mediaTag},
    });

  consumer.on('transportclose', () => {
      // console.log(`consumer's transport closed`, consumer.id);
      
      closeConsumer(roomState, consumer);
  });
  consumer.on('producerclose', () => {
      // console.log(`consumer's producer closed`, consumer.id);
      closeConsumer(roomState, consumer);
  });

    roomState.consumers.push(consumer);
  } catch (error) {
    console.error('consume failed', error);
    return;
  }
  // console.log(consumer);
  if (consumer.type === 'simulcast') {
    // console.log('simulcast!!')
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
  }
  // console.log('consumer', consumer);
  return {
    producerId: producer.id,
    id: consumer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused
  };
} 

async function closeProducer(roomState, producer) {
  await producer.close();
  roomState.producers = roomState.producers.filter((p) => p.id !== producer.id);
}

async function closeConsumer(roomState, consumer) {
  // console.log('closing consumer', consumer.id, consumer.appData);
  // console.log(`close Consumer!!! ${consumer.id}`)
  await consumer.close();

  // remove this consumer from our roomState.consumers list
  roomState.consumers = roomState.consumers.filter((c) => c.id !== consumer.id);

}

async function closeTransport(roomState, transport) {
    try {
        // console.log('closing transport', transport.id, transport.appData);

        // our producer and consumer event handlers will take care of
        // calling closeProducer() and closeConsumer() on all the producers
        // and consumers associated with this transport
        // console.log(transport)
        await transport.close();

        // so all we need to do, after we call transport.close(), is update
        // our roomState data structure
        delete roomState.transports[transport.id];
    } catch (e) {
        console.error(e);
    }
}
