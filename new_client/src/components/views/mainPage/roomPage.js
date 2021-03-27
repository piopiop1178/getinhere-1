import React, { Component } from 'react';
import io from 'socket.io-client';
// import './roomPage.css'

import socketPromise from './socket.io-promise';
import * as mediasoup from "mediasoup-client";

const backUrl = 'https://localhost:4433'
const socket = io.connect(`${backUrl}`, {
    transports: ['websocket'],
});

socket.request = socketPromise.promise(socket);


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

let localStream = null;
let peers = {}
let audioctx
audioctx = new AudioContext()
let gains = {}


let device, 
recvTransport, 
sendTransport, 
videoProducer, 
audioProducer, 
consumers = []

let audio = new Audio('../music/all_falls_down.mp3');

const LEFT = 'ArrowLeft', UP = 'ArrowUp', RIGHT = 'ArrowRight', DOWN = 'ArrowDown';

// Initialize distance
let dist;

class Room extends Component {
    state = {
        roomName: "",
        userName: "",
        characterNum: -1,
        map: {},
        characterList: [],
        users: {},
        contextCharacter: document.getElementById("character-layer").getContext("2d"),
    }

    componentDidMount = async () => {
        this.setState({
            roomName: this.props.roomName,
            userName: this.props.userName,
            characterNum: this.props.characterNum,
            map: this.props.map,
            characterList: this.props.characterList
        })

        await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            const localVideo = document.getElementById("localVideo")
            localVideo.srcObject = stream;
            localStream = stream;
        }).catch(e => alert(`getusermedia error ${e.name}`))

        await this.clientLoadDevice();
        await this.createProducer();

        socket.on('sendUsers', (users) => {
            for (let socketId in users){
                this.state.users[socketId] = users[socketId];
                this.addPeer(socketId);
            }
            let socketId = socket.id
            this.state.users[socketId] = {userName: this.props.userName, characterNum: this.props.characterNum};
            console.log(this.state.users);
        });

        socket.emit('getUsers', this.props.roomName, this.props.userName, this.props.characterNum);

        socket.on('addUser', (socketId, userName, characterNum) => {
            this.state.users[socketId] = {userName: userName, characterNum: characterNum};
            this.addPeer(socketId);
            console.log('addUser', this.state.users[socketId].userName);
        });

        socket.on('removeUser', (socketId) => {
            console.log('removeUser', this.state.users[socketId].userName);
            this.removePeer(socketId);
            delete this.state.users[socketId]
        });

        /* 채팅 */

        socket.on('chat', (name, message) => {
            // console.log(name, message);
            document.getElementById("message-box").appendChild(this.makeMessageOther(name, message));
            this.scrollBottom("message-box");
        });
    
        // console.log(document.getElementById("chat-message"));
        
        document.getElementById("chat-message").addEventListener("keyup", (e) => {
            // console.log(e.code);
            if(e.code == "Enter"){
                this.sendChat();
            }
        });

        socket.on('signal', data => {
            peers[data.socket_id].signal(data.signal)
        })

        socket.on('music_on', () => {
        // console.log('music_on!');
            audio.play();
        })

        socket.on('music_off', () => {
            // console.log('music_off!');
            audio.pause();
        })

        // const body = document.querySelector('body');

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

        socket.on("update", (statuses, idArray) => {
            // console.log("update");
            // console.log(statuses)
            // console.log(idArray)
            this.updateWindowCenter(statuses[socket.id].status);
            const WIDTH = this.state.map._WIDTH;
            const HEIGHT = this.state.map._HEIGHT;
            // console.log(WIDTH, HEIGHT);
            const contextCharacter = this.state.contextCharacter
            contextCharacter.clearRect(0, 0, WIDTH, HEIGHT);
            contextCharacter.beginPath();
            idArray.forEach((id) => {
                // Audio volume change
                if (id !== socket.id && gains[id] != undefined) {
                    dist = this.calcDistance(statuses[id].status, statuses[socket.id].status)
                    // console.log(dist)
                    gains[id].gain.value = dist >= 10 ? 0 : (1 - 0.1*dist)
                }

                // 캐릭터 삽입 코드
                contextCharacter.drawImage(this.props.characterList[statuses[id].characterNum], 
                    statuses[id].status.x,
                    statuses[id].status.y,
                    statuses[id].status.width,
                    statuses[id].status.height
                    );
                contextCharacter.font = '20px bold';
                contextCharacter.fillText(statuses[id].userName,
                    statuses[id].status.x,
                    statuses[id].status.y,
                );
            });
        });
    }

    /* ---------------- 중요 ------------------- */

    addPeer = async (socket_id) => {
        let newStream = await this.createConsumer(socket_id);
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

    removePeer = async (socket_id) => {
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
    
        await this.unsubscribeFromTrack(socket_id, 'cam-video'); 
        await this.unsubscribeFromTrack(socket_id, 'cam-audio'); 
        // console.log(consumers);
        // if (peers[socket_id]) peers[socket_id].destroy() 
        // delete peers[socket_id]
    }

    /* ---------------- 중요 ------------------- */

    //tmp 승민
    clientLoadDevice = async () => {
        console.log(`Device! request: ${socket.request}`);
        const data = await socket.request('getRouterRtpCapabilities');
        console.log(`data._data: ${data._data}`); //왜 이거 못쓰는지?? 
        console.log('data', data);
        await this.loadDevice(data._data.rtpCapabilities);
        return;
    }

    loadDevice = async (routerRtpCapabilities) => {
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


    makeMessageOwn = (message) => {
        const messageOwn= document.createElement('div');
        messageOwn.className = "message-own";
    
        const messageText = document.createElement('div');
        messageText.className = "message-text";
        messageText.appendChild(document.createTextNode(message));
    
        messageOwn.appendChild(messageText);
    
        return messageOwn;
    }

    scrollBottom = (id) => {
        const element = document.getElementById(id);
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }

    sendChat = () => {
        const name = socket.id;
        const chatMessage = document.getElementById("chat-message");
        const message = chatMessage.value;
        // console.log(message)
        if (message.replace(/^\s+|\s+$/g,"") === ""){
            chatMessage.value = null;
            return;
        }
        document.getElementById("message-box").appendChild(this.makeMessageOwn(message));
        this.scrollBottom("message-box");
        chatMessage.value = null;
        // console.log(name, message);
        socket.emit('chat', name, message);
    }

    makeMessageOther = (name, message) => {
        const messageOther= document.createElement('div');
        messageOther.className = "message-other";
    
        const messageName = document.createElement('div');
        messageName.className = "message-name";
        messageName.appendChild(document.createTextNode(name));
    
        const messageText = document.createElement('div');
        messageText.className = "message-text";
        messageText.appendChild(document.createTextNode(message));
    
        messageOther.appendChild(messageName);
        messageOther.appendChild(messageText);
    
        return messageOther;
    }

    /* -----------------------------------------------------------  */

    toggleMute = () => {
        for (let index in localStream.getAudioTracks()) {
            localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
            const muteButton = document.getElementById("muteButton");
            muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
        }
    }
    
    toggleVid = () =>{
        for (let index in localStream.getVideoTracks()) {
            localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
            const vidButton = document.getElementById("vidButton");
            vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
        }
    }

    // storelocalStorage = (myStatus) =>  {
    //     localStorage.setItem('myStatus', JSON.stringify(myStatus));
    //     let row = myStatus.y/TILE_LENGTH + 1;
    //     let col = myStatus.x/TILE_LENGTH + 1;
    //     localStorage.setItem('position', JSON.stringify({row, col}))
    // }
    
    updateButtons = () => {
        for (let index in localStream.getVideoTracks()) {
            const vidButton = document.getElementById("vidButton");
            vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
        }
        for (let index in localStream.getAudioTracks()) {
            const muteButton = document.getElementById("muteButton");
            muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
        }
    }

    updateWindowCenter = (myStatus) => {
        const TILE_LENGTH = this.state.map._TILE_LENGTH;
        window.scrollTo(myStatus.x - window.innerWidth/2  + TILE_LENGTH/2 , myStatus.y - window.innerHeight/2 + TILE_LENGTH/2 )
    }
    
    convertNumToTileRowCol = (num) => {
        const TILE_WIDTH = this.state.map._TILE_WIDTH;
        let arr = []
        let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
        let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
        arr[0] = row
        arr[1] = col
        return arr;
    }
    
    calcDistance = (status1, status2) => {
        const CHAR_SIZE = this.state.map._CHAR_SIZE;
        return Math.sqrt(Math.pow((status1.x - status2.x)/CHAR_SIZE, 2) + Math.pow((status1.y - status2.y)/CHAR_SIZE, 2))
    }

    createTransport = async (direction) => {
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
                    this.leaveRoom(socket)
                break;
    
                case 'closed':
                    console.log(`Transport closed ${transport.id}`)
                    this.leaveRoom(socket)
                break;
    
                case 'disconnected':
                    console.log(`Transport disconnected ${transport.id}`)
                    this.leaveRoom(socket)
                break;
    
                default: 
                    console.log(`Transpot ${state} ${transport.id}`)
                break;
            }
        });
        return transport;
    }

    createProducer = async () => {
        if (!sendTransport) {
            console.log('Creating sendTransport')
            sendTransport = await this.createTransport('send');
        }
    
        //! For temporary use
        if (!recvTransport) {
            console.log('Creating recvTransport')
            recvTransport = await this.createTransport('recv');
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

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    createConsumer = async (peerId) => {
        // create a receive transport if we don't already have one
        //! On error fixing
        if (!recvTransport) {
            console.log('Creating recvTransport')
            recvTransport = await this.createTransport('recv');
        }
        //! On error fixing
    
        let transportId = recvTransport.id;
        
        let videoConsumer = await this.createRealConsumer('cam-video', recvTransport, peerId, transportId)
        let audioConsumer = await this.createRealConsumer('cam-audio', recvTransport, peerId, transportId)
    
        let stream = await this.addVideoAudio(videoConsumer, audioConsumer);
    
        while (recvTransport.connectionState !== 'connected') {
        //   console.log('  transport connstate', recvTransport.connectionState );
            await this.sleep(100);
        }
        // okay, we're ready. let's ask the peer to send us media
        await this.resumeConsumer(videoConsumer);
        await this.resumeConsumer(audioConsumer);
        // keep track of all our consumers
        // updatePeersDisplay();
    
        return stream;
    }

    createRealConsumer = async (mediaTag, transport, peerId, transportId) => {
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
        return consumer;
    }

    resumeConsumer = async (consumer) => {
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

    unsubscribeFromTrack = async (peerId, mediaTag) => {
        let consumer = await this.findConsumerForTrack(peerId, mediaTag);
        
        if (!consumer) {
            console.log('ERROR: cannot find consumer')
            return;
        }
      
        try {
          await this.closeConsumer(consumer);
        } catch (e) {
          console.error(e);
        }
    }

    closeConsumer = async (consumer) => {
        if (!consumer) {
            console.log('ERROR: consumer undefined in closeConsumer')
            return;
        }
        // console.log('close consumer!')
        // console.log(consumers)
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
        // console.log(consumers)
    }

    findConsumerForTrack = async (peerId, mediaTag) => {
        return consumers.find((c) => (c.appData.peerId === peerId &&
                                        c.appData.mediaTag === mediaTag));
    }

    addVideoAudio = async (videoConsumer, audioConsumer) => {
        const stream = new MediaStream();
        await stream.addTrack(videoConsumer.track);
        await stream.addTrack(audioConsumer.track);
        return stream
    }

    sleep = async (ms) => {
        return new Promise((r) => setTimeout(() => r(), ms));
    }

    leaveRoom = async (socket) => {
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

    render() {
        return (
            <div className="room" id="room">
                <div className="video-box">
                    <div id="videos" className="video-container"></div>
                </div>
                <div className="local-video-box">
                    <div className="toggles">
                        <div className="chat-toggle">📢</div>
                        <div className="invite-toggle">👨‍👩‍👦</div>
                        <div className="invite-toggle-notice"> Invite Link Copied! </div>
                        <div className="etc-toggle">🔧</div>
                    </div>
                    <video id="localVideo" autoPlay muted></video>
                    <div className="setting-container">
                        {/* <button id="muteButton" className="settings" onClick={this.toggleMute}>Unmuted</button>
                        <button id="vidButton" className="settings" onClick={this.toggleVid}>Video Enabled</button> */}
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
                        <input type="text" id="chat-message"/>
                        <button onClick={this.sendChat}>✉</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Room;