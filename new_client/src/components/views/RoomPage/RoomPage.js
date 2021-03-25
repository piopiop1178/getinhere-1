import React, {Component} from 'react';
import {io} from 'socket.io-client';
import './roomPage.css'
//------------------DEBUG-------------------
import socketPromise from './socket.io-promise';
import config from './config';
// import mediasoup from 'mediasoup-client';
import * as mediasoup from "mediasoup-client";
import {
    types,
    version,
    detectDevice,
    Device,
    parseScalabilityMode
} from "mediasoup-client"
//------------------DEBUG-------------------
// import tile2 from '../../../images/tile2.jpg'
import icon2 from '../../../images/among.jpg' //TODO 임시방편
const icon = new Image();
icon.src = icon2
// tile.onload = () => {
//     drawBackground(contextBackground, MAP_SETTINGS, tile);
// };
// tile.src = this.state.characterList.tile;
//TODO 임시방편

// const socket = io.connect("https://localhost", {transport : ['websocket']});
        /* 소켓 실행시키기 */
const socket = io("https://13.209.75.25", {transport: ['websocket']}) //! 얘는 뭔가요

socket.request = socketPromise.promise(socket);

// let localStream = null;
// let peers = {}
// let audioctx
// let gains = {}


// let device, 
//     recvTransport, 
//     sendTransport, 
//     videoProducer, 
//     audioProducer, 
//     consumers = []

// async function clientLoadDevice(socket){
//     const data = await socket.request('getRouterRtpCapabilities');
//     console.log(`data._data: ${data._data}`); //왜 이거 못쓰는지?? 
//     console.log('data', data);
//     await loadDevice(data._data.rtpCapabilities);
// }

// async function loadDevice(routerRtpCapabilities) {
//     try {
//         device = new mediasoup.Device();
//         console.log('loadDevice function',device);
//         await device.load({ routerRtpCapabilities });

//         // console.log(device);
//     } catch (error) {
//         if (error.name === 'UnsupportedError') {
//         console.error('browser not supported');
//         }
//     }
// }

const configuration = {
    "iceServers": [{
            "urls": "stun:stun.l.google.com:19302"
        },
        {
            "urls": [
            "turn:13.250.13.83:3478?transport=udp"
            ],
            "username": "YzYNCouZM1mhqhmseWk6",
            "credential": "YzYNCouZM1mhqhmseWk6"
        }
    ]
}
let constraints = {
    audio: true,
    video: {
        width: {
            max: 1280,
            ideal: 720
        },
        height: {
            max: 720,
            ideal: 480
        }
    }
}


class RoomPage extends Component {

    state = {
        userid: "wow",
    }

    // toggleMute() {
    //     for (let index in localStream.getAudioTracks()) {
    //         localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
    //         muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    //     }
    // }
    
    // toggleVid() {
    //     for (let index in localStream.getVideoTracks()) {
    //         localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
    //         vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    //     }
    // }
    
    
    // updateButtons() {
    //     for (let index in localStream.getVideoTracks()) {
    //         vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    //     }
    //     for (let index in localStream.getAudioTracks()) {
    //         muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    //     }
    // }

    // ScrollBottom(id){
    //     const element = document.getElementById(id);
    //     element.scrollTop = element.scrollHeight - element.clientHeight;
    // }

    // makeMessageOwn(message){
    //     const messageOwn= document.createElement('div');
    //     messageOwn.className = "message-own";
    
    //     const messageText = document.createElement('div');
    //     messageText.className = "message-text";
    //     messageText.appendChild(document.createTextNode(message));
    
    //     messageOwn.appendChild(messageText);
    
    //     return messageOwn;
    // }

    // sendChat(){
    //     const name = socket.id;
    //     const chatMessage = document.getElementById("chat-message");
    //     const message = chatMessage.value;
    //     // console.log(message)
    //     if (message.replace(/^\s+|\s+$/g,"") === ""){
    //         chatMessage.value = null;
    //         return;
    //     }
    //     document.getElementById("message-box").appendChild(this.makeMessageOwn(message));
    //     this.ScrollBottom("message-box");
    //     chatMessage.value = null;
    //     // console.log(name, message);
    //     socket.emit('chat', name, message);
    // }
    
    // makeMessageOther(name, message){
    //     const messageOther= document.createElement('div');
    //     messageOther.className = "message-other";
    
    //     const messageName = document.createElement('div');
    //     messageName.className = "message-name";
    //     messageName.appendChild(document.createTextNode(name));
    
    //     const messageText = document.createElement('div');
    //     messageText.className = "message-text";
    //     messageText.appendChild(document.createTextNode(message));
    
    //     messageOther.appendChild(messageName);
    //     messageOther.appendChild(messageText);
    
    //     return messageOther;
    // }




    async componentDidMount() {
        //tmp 승민
        let localStream = null;
        let peers = {}
        let audioctx
        let gains = {}


        let device, 
            recvTransport, 
            sendTransport, 
            videoProducer, 
            audioProducer, 
            consumers = []


        async function clientLoadDevice(){
            console.log(`Device! request: ${socket.request}`);
            const data = await socket.request('getRouterRtpCapabilities');
            console.log(`data._data: ${data._data}`); //왜 이거 못쓰는지?? 
            console.log('data', data);
            await loadDevice(data._data.rtpCapabilities);
            return;
        }

        async function loadDevice(routerRtpCapabilities) {
            console.log('load device 입니다다아아ㅏ');
            try {
                console.log('load device try 입니다아아ㅏ');
                device = new mediasoup.Device();
                console.log('loadDevice function',device);
                await device.load({ routerRtpCapabilities });
                console.log('loadDevice function after',device);
                // console.log(device);
            } catch (error) {
                if (error.name === 'UnsupportedError') {
                console.error('browser not supported');
                }
            }
            return;
        }
        //tmp 승민



        socket.emit('start', document.location.pathname.slice(6))

        //-------------------------DEBUG---------------- 밖으로????? 
        let localVideo = document.querySelector('#localVideo');

        await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            localVideo.srcObject = stream;
            localStream = stream;
        }).catch(e => alert(`getusermedia error ${e.name}`))
        
        // await init(socket);
        // socket.emit('initDone');
        // socket.on('connect', async() =>{
        //     await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        //         localVideo.srcObject = stream;
        //         localStream = stream;
        //     }).catch(e => alert(`getusermedia error ${e.name}`))
            
        //     await init(socket);
        //     socket.emit('initDone');
        // });
        //-------------------------DEBUG----------------

        /* 맵 세팅정보 부모한태서 받아와야 한다 */
        // TODO 제대로 받아왔는지 확인하기
        //! 제대로 받아왔는지 확인하기
        let MAP_SETTINGS = this.props.MAP_SETTINGS
        let WIDTH = this.props.MAP_SETTINGS._WIDTH
        let HEIGHT = this.props.MAP_SETTINGS._HEIGHT
        let TILE_LENGTH = this.props.MAP_SETTINGS._TILE_LENGTH
        let TILE_WIDTH = this.props.MAP_SETTINGS._TILE_WIDTH
        let CHAR_SIZE = TILE_LENGTH
        // let WIDTH = MAP_SETTINGS._WIDTH
        // let HEIGHT = MAP_SETTINGS._HEIGHT
        // let TILE_LENGTH = MAP_SETTINGS._TILE_LENGTH
        // let TILE_WIDTH = MAP_SETTINGS._TILE_WIDTH
        // let CHAR_SIZE = TILE_LENGTH

        /* 로컬 스트림 받아오기 */
        // let localVideo = document.querySelector('#localVideo');
        // navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        //     localVideo.srcObject = stream;
        //     localStream = stream;
        //     init()
        // }).catch(e => alert(`getusermedia error ${e.name}`))

        //! 추후 수정 및 리팩토링 필요
        /* 캐릭터 캔버스 설정 */
        const canvasCharacter = document.createElement("canvas");
        const contextCharacter = canvasCharacter.getContext("2d");
        canvasCharacter.id = "character-layer";
        canvasCharacter.style.position = "fixed";
        canvasCharacter.style.zIndex = "-1";
        canvasCharacter.style.top = "0px";
        canvasCharacter.setAttribute("width", MAP_SETTINGS._WIDTH);
        canvasCharacter.setAttribute("height", MAP_SETTINGS._HEIGHT);
        document.body.appendChild(canvasCharacter);


        async function init() {
            // let query_param = get_query();
            // console.log('roomPage.js function init()',query_param);
            //Todo: after make main page, add url
            // socket = io("/room", { query: query_param }) //! 얘는 뭔가요
            
            await clientLoadDevice();

            let MAP_SETTINGS2 = null;
            const LEFT = 'ArrowLeft', UP = 'ArrowUp', RIGHT = 'ArrowRight', DOWN = 'ArrowDown';
        
            audioctx = new AudioContext()
        
            // Initialize distance
            let dist;
        
            window.addEventListener('keydown' ,(e)=> {
                let st = localStorage.getItem('myStatus');
                let parsed_status = JSON.parse(st);
                let curr_x = parsed_status.x;
                let curr_y = parsed_status.y;
        
                if (curr_x <= 60 && 1200 - curr_y <= 120 && e.code === "KeyX"){
                    socket.emit('music');
                }
        
                socket.emit('keydown', e.code);
                if(e.code == RIGHT) e.preventDefault();
                if(e.code == LEFT)  e.preventDefault();
                if(e.code == DOWN)  e.preventDefault();
                if(e.code == UP)    e.preventDefault();
            })
            window.addEventListener("keyup", function (e) {
                socket.emit("keyup", e.code);
            });
    
            // socket.on("update", function (statuses) {
            socket.on("update", function (statuses, idArray) {
                // if (MAP_SETTINGS2 == null) return;

                storelocalStorage(statuses[socket.id].status);
                updateWindowCenter(statuses[socket.id].status);
        
                contextCharacter.clearRect(0, 0, WIDTH, HEIGHT);
                contextCharacter.beginPath();
                idArray.forEach(function (id) {
                    // Audio volume change
                    if (id !== socket.id && gains[id] != undefined) {
                        dist = calcDistance(statuses[id].status, statuses[socket.id].status)
                        // console.log(dist)
                        gains[id].gain.value = dist >= 10 ? 0 : (1 - 0.1*dist)
                    }
                    // 캐릭터 삽입 코드
                    contextCharacter.drawImage(icon, 
                        statuses[id].status.x,
                        statuses[id].status.y,
                        statuses[id].status.width,
                        statuses[id].status.height
                        );
                });
            });
        
            // ----------------------------!!RTC!!---------------------------
            await createProducer();

            socket.on('initReceive', socket_id => {
                console.log('INIT RECEIVE ' + socket_id)
                addPeer(socket_id, false)
        
                socket.emit('initSend', socket_id)
            })
        
            socket.on('initSend', socket_id => {
                console.log('INIT SEND ' + socket_id)
                addPeer(socket_id, true)
            })
        
            socket.on('removePeer', socket_id => {
                console.log('removing peer ' + socket_id)
                removePeer(socket_id)
            })
        
            socket.on('disconnect', () => {
                console.log('GOT DISCONNECTED')
                for (let socket_id in peers) { 
                    removePeer(socket_id)
                }
            })
        
            socket.on('signal', data => {
                peers[data.socket_id].signal(data.signal)
            })
        
            //! 일단 주석해
            //TODO audio가 뜻하는게 뭘까. 강산이가 만든 코드
            // socket.on('music_on', () => {
            //     // console.log('music_on!');
            //     audio.play();
            // })
        
            // socket.on('music_off', () => {
            //     // console.log('music_off!');
            //     audio.pause();
            // })
            // --------------------------------------------------------------
        
            socket.on('chat', (name, message) => {
                // console.log(name, message);
                document.getElementById("message-box").appendChild(this.makeMessageOther(name, message));
                this.ScrollBottom("message-box");
            });
        
            // console.log(document.getElementById("chat-message"));
            
            document.getElementById("chat-message").addEventListener("keyup", (e) => {
                // console.log(e.code);
                if(e.code == "Enter"){
                    this.sendChat();
                }
            });
        
        }

        await init();
        socket.emit('initDone');
            
            async function removePeer(socket_id) {
                console.log('removePeer!!')
                let videoEl = document.getElementById(socket_id)
                if (videoEl) {
            
                    const tracks = videoEl.srcObject.getTracks();
                    console.log('Removing tracks')
                    console.log(tracks)
            
                    tracks.forEach(function (track) { 
                        track.stop()
                    })
            
                    videoEl.srcObject = null
                    videoEl.parentNode.removeChild(videoEl)
                }
            
                await unsubscribeFromTrack(socket_id, 'cam-video'); 
                await unsubscribeFromTrack(socket_id, 'cam-audio'); 
                // console.log(consumers);
                // if (peers[socket_id]) peers[socket_id].destroy() 
                // delete peers[socket_id]
            }

            // function removePeer(socket_id) {
            
            //     let videoEl = document.getElementById(socket_id)
            //     if (videoEl) {
            
            //         const tracks = videoEl.srcObject.getTracks();
            
            //         tracks.forEach(function (track) { 
            //             track.stop()
            //         })
            
            //         videoEl.srcObject = null
            //         // console.log('removePeer test@@@@@');
            //         videoEl.parentNode.removeChild(videoEl)
            //     }
            //     if (peers[socket_id]) peers[socket_id].destroy() 
            //     delete peers[socket_id]
            // }
            
            async function addPeer(socket_id, am_initiator) {
                let newStream = await createConsumer(socket_id);
                let newVid = document.createElement('video')
                let videos = document.getElementById('videos')
                newVid.srcObject = newStream
                newVid.id = socket_id
                // newVid.playsinline = false
                newVid.autoplay = true
                newVid.className = "vid"
                videos.appendChild(newVid)
                
                peers[socket_id] = null;
            }    
            // function addPeer(socket_id, am_initiator) {
            //     let newStream = new MediaStream(localStream)
            //     let newAudioTrack = localStream.getAudioTracks()[0]
            //     let src = audioctx.createMediaStreamSource(new MediaStream([newAudioTrack]))
            //     let dst = audioctx.createMediaStreamDestination()
            //     let gainNode = audioctx.createGain()
            //     gainNode.gain.value = 0
            //     gains[socket_id] = gainNode
            //     ;[src, gainNode, dst].reduce((a, b) => a && a.connect(b))
            //     newStream.removeTrack(newAudioTrack)
            //     newStream.addTrack(dst.stream.getAudioTracks()[0])
            
            //     //! TODO document.querySelector 는 나중에 수정해주도록 한다
            //     let videos = document.querySelector('#videos')
            //     peers[socket_id].on('stream', stream => {
            //         let newVid = document.createElement('video')
            //         newVid.srcObject = stream
            //         newVid.id = socket_id
            //         // newVid.playsinline = false
            //         newVid.autoplay = true
            //         newVid.className = "vid"
            //         videos.appendChild(newVid)
            //     })
            // }
            
            let muteButton = document.querySelector('#muteButton');
            let vidButton = document.querySelector('#vidButton');
            
            
            
            function get_query() {
                let url = document.location.href;
                let qs = url.substring(url.indexOf("?") + 1).split("&");
                let result = {}
                for (let i = 0; i < qs.length; i++) {
                    qs[i] = qs[i].split("=");
                    result[qs[i][0]] = decodeURIComponent(qs[i][1]);
                }
                return result;
            }
            
            function storelocalStorage(myStatus) {
                localStorage.setItem('myStatus', JSON.stringify(myStatus));
                let row = myStatus.y/TILE_LENGTH + 1;
                let col = myStatus.x/TILE_LENGTH + 1;
                localStorage.setItem('position', JSON.stringify({row, col}))
            }
            
            function updateWindowCenter(myStatus) {
                window.scrollTo(myStatus.x - window.innerWidth/2  + TILE_LENGTH/2 , myStatus.y - window.innerHeight/2 + TILE_LENGTH/2 )
            }
            
            
            function convertNumToTileRowCol(num) {
                let arr = []
                let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
                let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
                arr[0] = row
                arr[1] = col
                return arr;
            }
            
            
            function calcDistance(status1, status2) {
                return Math.sqrt(Math.pow((status1.x - status2.x)/CHAR_SIZE, 2) + Math.pow((status1.y - status2.y)/CHAR_SIZE, 2))
            }
            
            async function createTransport(direction) {
                console.log('createTransport device', device);
                let transport,
                    transportOptions = await socket.request('createTransport', {
                        forceTcp: false,
                        rtpCapabilities: device.rtpCapabilities,
                    });
            
                // console.log ('transport options', transportOptions);
            
                if (direction === 'recv') {
                    transport = await device.createRecvTransport(transportOptions);
                    transport.on('connect', async ({ dtlsParameters }, callback, errback) => { //중복된 코드 
                        await socket.request('connectTransport', {
                          transportId: transportOptions.id,
                          dtlsParameters
                        })
                          .then(callback)
                          .catch(errback);
                      });
            
                } else if (direction === 'send') {
                    // console.log(transportOptions);
                    transport = await device.createSendTransport(transportOptions);
                    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                        await socket.request('connectTransport', { 
                            transportId: transportOptions.id, 
                            dtlsParameters })
                          .then(callback)
                          .catch(errback);
                      });
                
                      transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
                    try {
                        const { id } = await socket.request('produce', {
                        transportId: transport.id,
                        kind,
                        rtpParameters,
                        appData
                        });
                        callback({ id });
                    } catch (err) {
                        errback(err);
                    }
                    });
                } else {
                    throw new Error(`bad transport 'direction': ${direction}`);
                }
                transport.on('connectionstatechange', (state) => {
                    switch (state) {
                        case 'connecting':
                            console.log(`Transport Connecting ${transport.id}`)
                        break;
            
                        case 'connected':
                            console.log(`Transport Connected ${transport.id}`)
                        break;
            
                        case 'failed':
                            console.log(`Transport Failed ${transport.id}`)
                            leaveRoom(socket)
                        break;
            
                        case 'closed':
                            console.log(`Transport closed ${transport.id}`)
                            leaveRoom(socket)
                        break;
            
                        case 'disconnected':
                            console.log(`Transport disconnected ${transport.id}`)
                            leaveRoom(socket)
                        break;
            
                        default: 
                            console.log(`Transpot ${state} ${transport.id}`)
                        break;
                    }
                });
                return transport;
            }
            
            async function createProducer() {
                if (!sendTransport) {
                    console.log('Creating sendTransport')
                    sendTransport = await createTransport('send');
                }
            
                //! For temporary use
                if (!recvTransport) {
                    console.log('Creating recvTransport')
                    recvTransport = await createTransport('recv');
                }
                //! For temporary use
            
                videoProducer = await sendTransport.produce({
                    track: localStream.getVideoTracks()[0],
            
                    appData: { mediaTag: 'cam-video' }
                });
                audioProducer = await sendTransport.produce({
                    track: localStream.getAudioTracks()[0],
                    appData: { mediaTag: 'cam-audio' }
                });
            }
            
            async function createConsumer(peerId) {
                // create a receive transport if we don't already have one
                //! On error fixing
                if (!recvTransport) {
                    console.log('Creating recvTransport')
                    recvTransport = await createTransport('recv');
                }
                //! On error fixing
            
                let transportId = recvTransport.id;
                
                let videoConsumer = await createRealConsumer('cam-video', recvTransport, peerId, transportId)
                let audioConsumer = await createRealConsumer('cam-audio', recvTransport, peerId, transportId)
            
                let stream = await addVideoAudio(videoConsumer, audioConsumer);
            
                while (recvTransport.connectionState !== 'connected') {
                //   console.log('  transport connstate', recvTransport.connectionState );
                    await sleep(100);
                }
                // okay, we're ready. let's ask the peer to send us media
                await resumeConsumer(videoConsumer);
                await resumeConsumer(audioConsumer);
                // keep track of all our consumers
                // updatePeersDisplay();
            
                return stream;
            }
            
            async function createRealConsumer(mediaTag, transport, peerId, transportId){
                
                const Data = await socket.request('consume', { rtpCapabilities: device.rtpCapabilities, mediaTag, peerId , transportId });
                console.log(Data);
                let {
                    producerId,
                    id,
                    kind,
                    rtpParameters,
                } = Data;
            
                let codecOptions = {};
                const consumer = await transport.consume({
                    id,
                    producerId,
                    kind,
                    rtpParameters,
                    codecOptions,
                    appData: { peerId, mediaTag }
                });
            
                consumers.push(consumer);
                // console.log(consumers);
                return consumer;
            }
            
            async function resumeConsumer(consumer) {
                if (consumer) {
                //   console.log('resume consumer', consumer.appData.peerId, consumer.appData.mediaTag);
                  try {
                    await socket.request('resumeConsumer', { consumerId: consumer.id })
                    // await sig('resume-consumer', { consumerId: consumer.id });
                    await consumer.resume();
                  } catch (e) {
                    console.error(e);
                  }
                }
              }
            
            async function unsubscribeFromTrack(peerId, mediaTag) {
                let consumer = await findConsumerForTrack(peerId, mediaTag);
                
                if (!consumer) {
                    console.log('ERROR: cannot find consumer')
                    return;
                }
              
                try {
                  await closeConsumer(consumer);
                } catch (e) {
                  console.error(e);
                }
            }
            
            async function closeConsumer(consumer) {
            if (!consumer) {
                console.log('ERROR: consumer undefined in closeConsumer')
                return;
            }
            console.log('close consumer!')
            console.log(consumers)
            // console.log('closing consumer', consumer.appData.peerId, consumer.appData.mediaTag);
            try {
                // tell the server we're closing this consumer. (the server-side
                // consumer may have been closed already, but that's okay.)
                await socket.request('closeConsumer', { consumerId: consumer.id });
                // await sig('close-consumer', { consumerId: consumer.id });
                await consumer.close();
                consumers = consumers.filter((c) => c !== consumer);
                // removeVideoAudio(consumer);
            } catch (e) {
                console.error(e);
            }
            console.log(consumers)
            }
            
            async function findConsumerForTrack(peerId, mediaTag) {
                return consumers.find((c) => (c.appData.peerId === peerId &&
                                                c.appData.mediaTag === mediaTag));
            }
            
            async function addVideoAudio(videoConsumer, audioConsumer){
                const stream = new MediaStream();
                await stream.addTrack(videoConsumer.track);
                await stream.addTrack(audioConsumer.track);
                return stream
            }
            
            async function sleep(ms) {
                return new Promise((r) => setTimeout(() => r(), ms));
            }

            async function leaveRoom(socket) {
                // closing the transports closes all producers and consumers. we
                // don't need to do anything beyond closing the transports, except
                // to set all our local variables to their initial states
                try {
                    if (recvTransport) {
                        await socket.request('closeTransport', { transportId: recvTransport.id })
                        await recvTransport.close()
                        recvTransport = null
                    }
                    if (sendTransport) {
                        await socket.request('closeTransport', { transportId: sendTransport.id })
                        await sendTransport.close()
                        sendTransport = null
                    }
                } catch (e) {
                    console.error(e);
                }
                videoProducer = null;
                audioProducer = null;
                consumers = [];
            }

            // function sendChat(){
            //     const name = socket.id;
            //     const chatMessage = document.getElementById("chat-message");
            //     const message = chatMessage.value;
            //     // console.log(message)
            //     if (message.replace(/^\s+|\s+$/g,"") === ""){
            //         chatMessage.value = null;
            //         return;
            //     }
            //     document.getElementById("message-box").appendChild(makeMessageOwn(message));
            //     ScrollBottom("message-box");
            //     chatMessage.value = null;
            //     // console.log(name, message);
            //     socket.emit('chat', name, message);
            // }
            
            // function ScrollBottom(id){
            //     const element = document.getElementById(id);
            //     element.scrollTop = element.scrollHeight - element.clientHeight;
            // }
            
            // function makeMessageOwn(message){
            //     const messageOwn= document.createElement('div');
            //     messageOwn.className = "message-own";
            
            //     const messageText = document.createElement('div');
            //     messageText.className = "message-text";
            //     messageText.appendChild(document.createTextNode(message));
            
            //     messageOwn.appendChild(messageText);
            
            //     return messageOwn;
            // }
            
            // function makeMessageOther(name, message){
            //     const messageOther= document.createElement('div');
            //     messageOther.className = "message-other";
            
            //     const messageName = document.createElement('div');
            //     messageName.className = "message-name";
            //     messageName.appendChild(document.createTextNode(name));
            
            //     const messageText = document.createElement('div');
            //     messageText.className = "message-text";
            //     messageText.appendChild(document.createTextNode(message));
            
            //     messageOther.appendChild(messageName);
            //     messageOther.appendChild(messageText);
            
            //     return messageOther;
            // }
        //END 추후 수정 및 리팩토링 필요
    }

    render(){
        return (
        <div className="room">
            <div className="video-box">
                <div id="videos" className="video-container">
                </div>
            </div>
            <div className="local-video-box">
                <div className="toggles">
                    <div className="chat-toggle">📢</div>
                    <div className="invite-toggle">👨‍👩‍👦</div>
                    <div className="invite-toggle-notice"> Invite Link Copied! </div>
                    <div className="etc-toggle">🔧</div>
                </div>
                <video id="localVideo" ref={this.localStream} autoPlay muted></video>
                <div className="setting-container">
                        {/* 일단 토글버튼은 나중에 */}
                        {/* <button id="muteButton" className="settings" onClick={this.toggleMute()}>Unmuted</button> */}
                        {/* <button id="vidButton" className="settings" onClick={this.toggleVid()}>Video Enabled</button> */}
                </div>
            </div>
    
            <div className="chat-box">
                <div className="message-box" id="message-box">
                    <div className="message-other">
                        <div className="message-name"> other </div>
                        <div className="message-text"> message </div>
                    </div>
                    <div className="message-own">
                        <div className="message-text"> my message </div>
                    </div>
                </div>
                <div className="input-bar">
                    <input type="text" id="chat-message" /> 
                    {/* <button onClick={this.sendChat()}>✉</button> */}
                </div>
            </div>
        </div>
        )
    }
}

export default RoomPage