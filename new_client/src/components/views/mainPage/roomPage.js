import React, { Component } from 'react';
// import {io} from 'socket.io-client';
// import dotenv from 'dotenv';
// require('dotenv').config()

import * as mediasoup from "mediasoup-client";
// import {
//     types,
//     version,
//     detectDevice,
//     Device,
//     parseScalabilityMode
// } from "mediasoup-client"

import beerSource from './sounds/beer.mp3'
import cocktailSource from './sounds/cocktail.mp3'
import wineSource from './sounds/wine.mp3'
import glassBreakSource from './sounds/glassbreak.mp3'
import IframePage from './iframePage/iframe.js'; // 0329 승민
import YoutubeMain from '../youtubePage/youtubeMain';
import Youtube from '../youtubePage/youtube-fetch';
import YoutubeIframe from '../youtubePage/youtubeIframe';
import ToggleButton from './toggleButton/toggleButton';
import { Spring, animated } from 'react-spring'
import Guidance from './guidance';

const uuuuu = new Youtube();

const beer = new Audio();
const cocktail = new Audio();
const wine = new Audio();
const glassbreak = new Audio();
beer.src = beerSource
cocktail.src = cocktailSource
wine.src = wineSource
glassbreak.src = glassBreakSource

let socket;
let reconnect_checker = false

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
let localScreen = null;

let peers = {}
// let audioctx
// audioctx = new AudioContext()
// let gains = {}


let device, 
recvTransport, 
sendTransport, 
videoProducer, 
audioProducer,
screenVideoProducer,
screenAudioProducer

let consumers = []

// let audio = new Audio('../music/all_falls_down.mp3');

const LEFT = 'ArrowLeft', UP = 'ArrowUp', RIGHT = 'ArrowRight', DOWN = 'ArrowDown';

// Initialize distance
// let dist;

let alcholSoundOnceFlag;
let keyDownUpOnceFlag;
let keyUpBuffer = {};
let curr_space
let changeSpace = true

/* * 뒤로가기 시 그냥 리로드하기 */
window.onpopstate = function(event) { 
    window.location.reload();
};

// youtube synchro play
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player1;
var player2;
function onYouTubeIframeAPIReady1(video_id) {
    player1 = new window.YT.Player("player1", {
        height: '100%',
        width: '100%',
        videoId: video_id,
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        },
        playerVars: {
            autoplay: 1,        // Auto-play the video on load
            controls: 1,        // Show pause/play buttons in player
            showinfo: 0,        // Hide the video title
            modestbranding: 1,  // Hide the Youtube Logo
            loop: 0,            // Run the video in a loop
            fs: 0,              // Hide the full screen button
            iv_load_policy: 0,  // Hide the Video Annotations
            mute: 0
        },
    });
}
function onYouTubeIframeAPIReady2(video_id) {
    player2 = new window.YT.Player("player2", {
        height: 0,
        width: 0,
        videoId: video_id,
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        },
        playerVars: {
            autoplay: 1,        // Auto-play the video on load
            controls: 1,        // Show pause/play buttons in player
            showinfo: 0,        // Hide the video title
            modestbranding: 1,  // Hide the Youtube Logo
            loop: 0,            // Run the video in a loop
            fs: 0,              // Hide the full screen button
            iv_load_policy: 0,  // Hide the Video Annotations
            mute: 0
        },
    });
}
function onPlayerReady(event) {
    event.target.setVolume(40);
}
var done = false;
function onPlayerStateChange(event) {
    if (event.data == window.YT.PlayerState.PLAYING && !done) {
        // setTimeout(player.unMute(), 1000);
        done = true;
    }
}

class Room extends Component {
    state = {
        roomName: "",
        userName: "",
        characterNum: -1,
        map: {},
        characterList: [],
        users: {},
        contextCharacter: document.getElementById("character-layer").getContext("2d"),
        objects: 0, // 0: 기본상태, 1: 동영상 검색창, 2: 동영상 같이보기, 3: 게임하기, 4. 노래
        faceList: [], //
        guidance: false,
    }

    addMyFace = () => {
        //! 내 얼굴 넣기
        // if (this.props.faceMode) {
            let characterImage = new Image();
            characterImage.onload = () => {
                // this.state.contextHide.drawImage(characterImage, 0, 0, 60, 60)
            }
            characterImage.src = this.props.faceMode //! 그리기
            this.state.faceList[socket.id] = characterImage; //! 리스트에 넣기
        // }
        //! 내 얼굴 넣기 끝
    }

    componentDidMount = async () => {
        socket = this.props.socket;
        

        /* Room 에서 사용할 socket on 정의 */
        await this.initSocket();

        /* 연결 준비가 되었음을 알림 */
        if(this.props.faceMode) {
            this.addMyFace()
            socket.emit('ready', this.props.roomName, this.props.userName, this.props.faceMode);    
        } else {
            socket.emit('ready', this.props.roomName, this.props.userName, this.props.characterNum);
        }
        
        document.getElementById("chat-message").addEventListener("keyup", (e) => {
            if(e.code === "Enter"){
                this.sendChat();
            }
        });

        
        window.addEventListener('keydown' ,(e)=> {
            if(e.path[0]===document.getElementById("chat-message")){
                // e.preventDefault();
                return;
            }

            // if during event except music prevent move
            if (this.state.objects !== 0 && this.state.objects !== 5){
                return;
            }

            let st = localStorage.getItem('myStatus');
            let parsed_status = JSON.parse(st);
            let curr_x = parsed_status.x;
            let curr_y = parsed_status.y;
    
            /* 캐릭터 술 캔버스 설정 */
            if (e.code === "KeyB" && document.activeElement.tagName ==='BODY') {
                alcholSoundOnceFlag = true
                socket.emit('alchol-icon', 'beer');
            }
            if (e.code === "KeyC" && document.activeElement.tagName ==='BODY') {
                alcholSoundOnceFlag = true
                socket.emit('alchol-icon', 'cocktail');
            }
            if (e.code === "KeyW" && document.activeElement.tagName ==='BODY') {
                alcholSoundOnceFlag = true
                socket.emit('alchol-icon', 'wine');
            }

            /* Test command for socket disconnect */
            if(e.code === "KeyQ" && e.ctrlKey) {
                socket.emit("testSocketDisconnect")
            }

            if (e.code === "KeyE") {
                this.screenShare()
            }
    
            /* 동영상, 게임하기, 노래 등 */
            // 게임하는 2번 방
            if (e.code === "KeyX" && document.activeElement.tagName ==='BODY' && curr_space === 2){
                if (this.state.objects ===0) {
                    this.setState({objects : 3})
                    document.getElementById("character-layer").style.backgroundColor = 'rgb(0,0,51)';
                }
                else {
                    this.setState({objects : 0})    
                    this.updatePositionSocketOn()
                    document.getElementById("character-layer").style.removeProperty("background-color");
                }
            }
            
            // 영상보는 3번 방
            if (e.code ==="KeyX" && document.activeElement.tagName ==='BODY' && curr_space === 3){            
                // socket.emit('youtube');
                if (this.state.objects ===0) {
                    this.setState({objects : 1})
                    document.getElementById("character-layer").style.backgroundColor = 'rgb(0,0,51)';
                }
                else {
                    this.setState({objects : 0})      
                    this.updatePositionSocketOn()
                    document.getElementById("character-layer").style.removeProperty("background-color");
                }
            }

            // 음악듣는 1번 방
            if (e.code ==="KeyX" && document.activeElement.tagName ==='BODY' && curr_space === 1){            
                if (this.state.objects ===0) {
                    this.setState({objects : 4})
                    document.getElementById("character-layer").style.backgroundColor = 'rgb(0,0,51)';
                }
                else {
                    this.setState({objects : 0})      
                    this.updatePositionSocketOn()
                    document.getElementById("character-layer").style.removeProperty("background-color");
                }
            }

            e.preventDefault()
            if(e.code === UP    )    {socket.emit('keydown', e.code); keyDownUpOnceFlag = true;}
            if(e.code === RIGHT )    {socket.emit('keydown', e.code); keyDownUpOnceFlag = true;}
            if(e.code === DOWN  )    {socket.emit('keydown', e.code); keyDownUpOnceFlag = true;}
            if(e.code === LEFT  )    {socket.emit('keydown', e.code); keyDownUpOnceFlag = true;}

        })

        window.addEventListener("keyup", function (e) {
            if(e.path[0]===document.getElementById("chat-message")){
                return;
            }


            if (keyDownUpOnceFlag) {
                keyUpBuffer[e.code] = true;
              } else {
                socket.emit("keyup", e.code);
              }
        });
        this.setState({
            roomName: this.props.roomName,
            userName: this.props.userName,
            characterNum: this.props.characterNum,
            map: this.props.map,
            characterList: this.props.characterList
        });        
    }

    updatePosition = (statuses, idArray) => {
        keyDownUpOnceFlag = false;
        if (keyUpBuffer[UP]) { socket.emit("keyup", UP); keyUpBuffer[UP] = false;} 
        if (keyUpBuffer[RIGHT]) { socket.emit("keyup", RIGHT); keyUpBuffer[RIGHT] = false;} 
        if (keyUpBuffer[DOWN]) { socket.emit("keyup", DOWN); keyUpBuffer[DOWN] = false;} 
        if (keyUpBuffer[LEFT]) { socket.emit("keyup", LEFT); keyUpBuffer[LEFT] = false;} 

        // const WIDTH = this.state.map._WIDTH;
        // const HEIGHT = this.state.map._HEIGHT;
        const contextCharacter = this.state.contextCharacter;
        let myStatus = statuses[socket.id].status;

        curr_space = this.calcSpace(myStatus.x, myStatus.y)
        if ((myStatus.space !== curr_space) && changeSpace) {
            changeSpace = false
            socket.emit('spaceChange', myStatus.space, curr_space)
        }

        this.storelocalStorage(myStatus);
        this.updateWindowCenter(myStatus);
        contextCharacter.clearRect(myStatus.x - window.innerWidth, myStatus.y - window.innerHeight, window.innerWidth*2, window.innerHeight*2); //TODO 내가 보는곳만 하기
        contextCharacter.beginPath();
        idArray.forEach((id) => {
            // Audio volume change
            // if (id !== socket.id && gains[id] != undefined) {
            //     dist = this.calcDistance(statuses[id].status, statuses[socket.id].status)
            //     gains[id].gain.value = dist >= 10 ? 0 : (1 - 0.1*dist)
            // }

            // 다른 캐릭터가 내 화면 밖으로 나가면 그려주지않고 넘어간다
            if (Math.abs(myStatus.x - statuses[id].status.x) > window.innerWidth && Math.abs(myStatus.y - statuses[id].status.y) > window.innerHeight) {
                return;
            }

            // let drawImageSrc = statuses[id].characterNum != -1 ? this.props.characterList[statuses[id].characterNum] : this.state.faceList[statuses[id].id]
            // if (!drawImageSrc) {return;}

            if(statuses[id].characterNum == -1) {
                if(!this.state.faceList[statuses[id].id]) {return;}
                contextCharacter.drawImage(
                    this.state.faceList[statuses[id].id], 
                    statuses[id].status.x - 13,
                    statuses[id].status.y - 13,
                    86,
                    86,
                );
            } else {
                // 캐릭터 삽입 코드
                contextCharacter.drawImage(
                    this.props.characterList[statuses[id].characterNum], 
                    statuses[id].status.x - 3,
                    statuses[id].status.y - 3,
                    statuses[id].status.width + 6,
                    statuses[id].status.height + 6,
                );
            }


            // 술 이모티콘 삽입 코드
            if (statuses[id].status.alchol) {
                let alchol;

                if (statuses[id].status.alchol === 'beer') {
                    if (alcholSoundOnceFlag) {
                        beer.play()
                        alcholSoundOnceFlag = false
                    }
                    alchol = "🍺"
                } else if (statuses[id].status.alchol === 'cocktail') {
                    if (alcholSoundOnceFlag) {
                        cocktail.play()
                        alcholSoundOnceFlag = false
                    }
                    alchol = "🍸"
                } else if (statuses[id].status.alchol === 'wine') {
                    if (alcholSoundOnceFlag) {
                    wine.play()
                    alcholSoundOnceFlag = false
                    }
                    alchol = "🍷"
                }
                contextCharacter.fillText(alchol,
                    statuses[id].status.x + 5,
                    statuses[id].status.y,
                    );
                }
            contextCharacter.font = '40px Gaegu';
            contextCharacter.shadowColor = 'white' // string
                //Color of the shadow;  RGB, RGBA, HSL, HEX, and other inputs are valid.
            contextCharacter.shadowOffsetX = 0; // integer
                //Horizontal distance of the shadow, in relation to the text.
            contextCharacter.shadowOffsetY = 0; // integer
                //Vertical distance of the shadow, in relation to the text.
            contextCharacter.shadowBlur = 5; // integer


            contextCharacter.fillText(statuses[id].userName,
                statuses[id].status.x,
                statuses[id].status.y + 90,
            );
        });
        changeSpace = true
    }

    updatePositionSocketOff = () => {
        keyUpBuffer[UP] = false;
        keyUpBuffer[DOWN] = false;
        keyUpBuffer[LEFT] = false;
        keyUpBuffer[RIGHT] = false;
        socket.emit("keyup", UP);
        socket.emit("keyup", DOWN);
        socket.emit("keyup", LEFT);
        socket.emit("keyup", RIGHT);
        socket.removeAllListeners("update");
    }
    
    updatePositionSocketOn = () => {
        socket.on("update", this.updatePosition );
    }

    initSocket = async () => {
        /* room에 자신의 socket이 추가된 후 해당 room의 기존 user 정보를 수신 */
        socket.on('sendUsers', async (users) => {
            await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                const localVideo = document.getElementById("localVideo")
                localVideo.srcObject = stream;
                localStream = stream;
            }).catch(e => alert(`getusermedia error ${e.name}`));
    
            await this.clientLoadDevice();
            await this.createProducer();
            let sameSpace
            for (let socketId in users){
                sameSpace = (users[socketId].space === curr_space) ? true : false
                this.state.users[socketId] = users[socketId];
                this.addPeer(socketId, sameSpace);
                await this.addFace(socketId, users[socketId].characterNum)
            }
            let socketId = socket.id
            this.state.users[socketId] = {userName: this.props.userName, characterNum: this.props.characterNum};

            /* 시작 알림 */
            if(this.props.faceMode) {
                socket.emit('start', this.props.roomName, this.props.userName, this.props.faceMode, curr_space);    
                this.addMyFace()
            } else {
                socket.emit('start', this.props.roomName, this.props.userName, this.props.characterNum, curr_space);
            }
        });

        socket.on('music_on', (video_id) => {
            if (curr_space!==1){
                return;
            }
            this.setState({objects:5})
            onYouTubeIframeAPIReady2(video_id)
            this.updatePositionSocketOn()
            document.getElementById("character-layer").style.removeProperty("background-color");
        })

        socket.on('music_off', () => {
            // 210330기준 기능없음
        });

        socket.on('chat', (name, message) => {
            document.getElementById("message-box").appendChild(this.makeMessageOther(name, message));
            this.scrollBottom("message-box");
        });

        // socket.on('youtube_on', () =>{
        //     this.setState({objects : 1})
        // })
        // socket.on('youtube_off', () =>{
        //     this.setState({objects : 0})
        // })
        
        socket.on('video_on', (video_id)=>{
            if (curr_space!==3){
                return;
            }
            this.setState({objects:2})
            onYouTubeIframeAPIReady1(video_id)
        })

        socket.on('removeOutUser', (socketId) => {
            consumers.forEach((consumer) => {
                if (consumer.appData.peerId === socketId) {
                    this.pauseConsumer(consumer)
                }
            })

            let videoEl = document.getElementById(socketId)
            if (videoEl) {
                videoEl.style.display = 'none'
            }
        })
        socket.on('addInUser', (socketId) => {
            consumers.forEach((consumer) => {
                if (consumer.appData.peerId === socketId) {
                    this.resumeConsumer(consumer)
                }
            })

            let videoEl = document.getElementById(socketId)
            if (videoEl) {
                videoEl.style.display = 'block'
            }
        })

        // socket.on("update", (statuses, idArray) => {this.updatePosition(statuses, idArray)} );
        socket.on("update", this.updatePosition );

        socket.on('addUser', async (socketId, userName, characterNum, space) => {
            let sameSpace = (space === curr_space) ? true : false
            this.state.users[socketId] = {userName: userName, characterNum: characterNum};
            this.addPeer(socketId, sameSpace);
            await this.addFace(socketId, characterNum)
        });

        socket.on('removeUser', (socketId) => {
            this.removePeer(socketId);
            delete this.state.users[socketId]
        });

        socket.on('createScreenShareConsumer', async (socketId, audio) => {
            // let sameSpace = (users[socketId].space === curr_space) ? true : false
            console.log(socketId);
            let screenAudioConsumer = null;
            
            let screenVideoConsumer = await this.createRealConsumer('screen-video', recvTransport, socketId, recvTransport.id)

            if (audio){
                screenAudioConsumer = await this.createRealConsumer('screen-audio', recvTransport, socketId, recvTransport.id)
                await this.resumeConsumer(screenAudioConsumer, 'screen-audio');
            }

            let new_stream = await this.addVideoAudio(screenVideoConsumer, screenAudioConsumer);

            let videoEl = document.getElementById(socketId)
            
            await this.resumeConsumer(screenVideoConsumer, 'screen-video');

            videoEl.srcObject = new_stream;            

            //1. socketID 해당하는 consumer 만들기
            //2. video tag src 교체하기 
            //3. 같은 space 면 보이게 아니면 block
            //4. 
        });

        socket.on('endScreenShare', async (socketId, audio) => {
            let videoEl = document.getElementById(socketId)

            await this.closeClientTrackConsumer(socketId, 'screen-video')
            if (audio){
                await this.closeClientTrackConsumer(socketId, 'screen-audio')
            }

            let audioConsumer = consumers.find((c) => (c.appData.peerId === socketId &&
                c.appData.mediaTag === 'cam-audio'));

            let videoConsumer = consumers.find((c) => (c.appData.peerId === socketId &&
                c.appData.mediaTag === 'cam-video')); 
            
            let original_stream = await this.addVideoAudio(videoConsumer, audioConsumer);
            
            console.log(original_stream)
            videoEl.srcObject = original_stream;
        })

        socket.on('disconnect', async () => {
            for (let socket_id in this.state.users){
                this.disconnectPeer(socket_id);
            }

            peers = {}
            device = null;
            recvTransport = null
            sendTransport = null
            videoProducer = null
            audioProducer = null
            consumers = []
            await socket.connect()
        })

        socket.io.removeAllListeners("open")
        socket.io.on("open", async () => {
            if (reconnect_checker) {
                Object.keys(socket._callbacks).forEach(function(eventname) {
                    socket.removeAllListeners(eventname.slice(1))
                })
                // socket.removeAllListeners()
                socket.emit("initSocket", this.props.roomName);
                await this.initSocket()
                // socket.emit('ready', this.props.roomName, this.props.userName, this.props.characterNum);
                if(this.props.faceMode) {
                    socket.emit('ready', this.props.roomName, this.props.userName, this.props.faceMode);    
                } else {
                    socket.emit('ready', this.props.roomName, this.props.userName, this.props.characterNum);
                }
                
            }
        })
        reconnect_checker = true
    }

    /* ---------------- 중요 ------------------- */

    /* 얼굴모드: 다른 유저들의 얼굴데이터를 내 로컬스토리지에 저장하는 함수 */
    addFace = async (socketId, characterNum) => {
        if (characterNum < 30) { return; }
        let characterImage = new Image();
        characterImage.src = characterNum;
        this.state.faceList[socketId] = characterImage;
    }

    addPeer = async (socket_id, sameSpace) => {
        let newStream = await this.createConsumer(socket_id, sameSpace);
        let newVid = document.createElement('video')
        let videos = document.getElementById('videos')
        newVid.srcObject = newStream
        newVid.id = socket_id
        // newVid.playsinline = false
        newVid.autoplay = true
        newVid.className = "vid"
        videos.appendChild(newVid)
        
        if (sameSpace) {
            newVid.style.display = 'block'
        } else {
            newVid.style.display = 'none'
        }
        peers[socket_id] = null;
    }    

    removePeer = async (socket_id) => {
        let videoEl = document.getElementById(socket_id)
        if (videoEl) {
    
            const tracks = videoEl.srcObject.getTracks();
    
            tracks.forEach(function (track) { 
                track.stop()
            })
    
            videoEl.srcObject = null
            videoEl.parentNode.removeChild(videoEl)
        }
    
        // await this.unsubscribeFromTrack(socket_id, 'cam-video'); 
        // await this.unsubscribeFromTrack(socket_id, 'cam-audio');
        //!----------------------DEBUG---------------------
        await this.closeClientTrackConsumer(socket_id, 'cam-video'); 
        await this.closeClientTrackConsumer(socket_id, 'cam-audio');  
        //!----------------------DEBUG---------------------
        // if (peers[socket_id]) peers[socket_id].destroy() 
        // delete peers[socket_id]
    }

    disconnectPeer(socket_id) {
        let videoEl = document.getElementById(socket_id)
        if (videoEl) {
    
            const tracks = videoEl.srcObject.getTracks();
    
            tracks.forEach(function (track) { 
                track.stop()
            })
    
            videoEl.srcObject = null
            videoEl.parentNode.removeChild(videoEl)
        }
    
        this.closeAllTrackConsumer(socket_id, 'cam-video'); 
        this.closeAllTrackConsumer(socket_id, 'cam-audio'); 
    }

    /* ---------------- 중요 ------------------- */

    //tmp 승민
    clientLoadDevice = async () => {
        const data = await socket.request('getRouterRtpCapabilities');
        await this.loadDevice(data._data.rtpCapabilities);
        return;
    }

    loadDevice = async (routerRtpCapabilities) => {
        try {
            device = new mediasoup.Device();
            await device.load({ routerRtpCapabilities });
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
        const name = this.state.userName;
        const chatMessage = document.getElementById("chat-message");
        const message = chatMessage.value;
        if (message.replace(/^\s+|\s+$/g,"") === ""){
            chatMessage.value = null;
            return;
        }
        document.getElementById("message-box").appendChild(this.makeMessageOwn(message));
        this.scrollBottom("message-box");
        chatMessage.value = null;
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

    storelocalStorage = (myStatus) =>  {
        const TILE_LENGTH = this.state.map._TILE_LENGTH;
        localStorage.setItem('myStatus', JSON.stringify(myStatus));
        let row = myStatus.y/TILE_LENGTH + 1;
        let col = myStatus.x/TILE_LENGTH + 1;
        localStorage.setItem('position', JSON.stringify({row, col}))
    }
    
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

    calcSpace = (x, y) => {
        if (y > 360) {
            return 1;
        }
        else if (x <= 780) {
            return 2;
        }
        else if (x >= 1680) {
            return 4;
        }
        else {
            return 3;
        }
    }

    createTransport = async (direction) => {
        let transport,
            transportOptions = await socket.request('createTransport', {
                forceTcp: false,
                rtpCapabilities: device.rtpCapabilities,
            });
    
    
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
                    // console.log(`Transport Connecting ${transport.id}`)
                break;
    
                case 'connected':
                    // console.log(`Transport Connected ${transport.id}`)
                break;
    
                case 'failed':
                    // console.log(`Transport Failed ${transport.id}`)
                    this.leaveRoom(socket)
                break;
    
                case 'closed':
                    // console.log(`Transport closed ${transport.id}`)
                    this.leaveRoom(socket)
                break;
    
                case 'disconnected':
                    // console.log(`Transport disconnected ${transport.id}`)
                    this.leaveRoom(socket)
                break;
    
                default: 
                    // console.log(`Transpot ${state} ${transport.id}`)
                break;
            }
        });
        return transport;
    }

    createProducer = async () => {
        if (!sendTransport) {
            // console.log('Creating sendTransport')
            sendTransport = await this.createTransport('send');
        }
    
        //! For temporary use
        if (!recvTransport) {
            // console.log('Creating recvTransport')
            recvTransport = await this.createTransport('recv');
        }
        //! For temporary use
    
        videoProducer = await sendTransport.produce({
            track: localStream.getVideoTracks()[0],
            encodings : [
                {maxBitrate: 100000},
                {maxBitrate: 200000}
            ],
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

    createConsumer = async (peerId, sameSpace) => {
        // create a receive transport if we don't already have one
        //! On error fixing
        if (!recvTransport) {
            // console.log('Creating recvTransport')
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
        if (sameSpace) {
            await this.resumeConsumer(videoConsumer, 'cam-video');
            await this.resumeConsumer(audioConsumer, 'cam-audio');
        }
        // keep track of all our consumers
        // updatePeersDisplay();
    
        return stream;
    }

    createRealConsumer = async (mediaTag, transport, peerId, transportId) => {
        const Data = await socket.request('consume', { rtpCapabilities: device.rtpCapabilities, mediaTag, peerId , transportId });
        // console.log(Data);
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

    resumeConsumer = async (consumer, mediaTag) => {
        if (consumer) {
            //   console.log('resume consumer', consumer.appData.peerId, consumer.appData.mediaTag);
            try {
                await socket.request('resumeConsumer', { consumerId: consumer.id, mediaTag: mediaTag})
                // await sig('resume-consumer', { consumerId: consumer.id });
                await consumer.resume();
            } catch (e) {
                console.error(e);
            }
        }
    }

    pauseConsumer = async (consumer, mediaTag) => {
        if (consumer) {
            try {
                await socket.request('pauseConsumer', { consumerId: consumer.id, mediaTag: mediaTag })
                await consumer.pause()
            } catch (e) {
                console.error(e)
            }
        }
    }

    resumeProducer = async (producer, mediaTag) => {
        if (producer) {
            try {
                await socket.request('resumeProducer', { producerId: producer.id, mediaTag: mediaTag })
                await producer.resume()
            } catch (e) {
                console.error(e)
            }
        }
    }

    pauseProducer = async (producer, mediaTag) => {
        if (producer) {
            try {
                await socket.request('pauseProducer', { producerId: producer.id, mediaTag: mediaTag})
                await producer.pause()
            } catch (e) {
                console.error(e)
            }
        }
    }

    
    //!------------------DEBUG---------------------
    closeClientTrackConsumer = async (peerId, mediaTag) => {
    // unsubscribeFromTrack = async (peerId, mediaTag) => {
    //!------------------DEBUG---------------------
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

    async closeAllTrackConsumer(peerId, mediaTag) {
        let consumer = await this.findConsumerForTrack(peerId, mediaTag);
    
        if (!consumer) {
            console.log('ERROR: cannot find consumer')
            return;
        }
    
        try {
            await socket.request('closeConsumer', { consumerId: consumer.id })
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
        
        try {
            await consumer.close();
            consumers = consumers.filter((c) => c !== consumer);
        } catch (e) {
            console.error(e);
        }
    }

    closeProducer = async (producer) => {
        if (!producer) {
            console.log('ERROR: producer undefined in closeConsumer')
            return;
        }
        try {
            await producer.close();
        } catch (e) {
            console.error(e);
        }
    }

    findConsumerForTrack = async (peerId, mediaTag) => {
        return consumers.find((c) => (c.appData.peerId === peerId &&
                                        c.appData.mediaTag === mediaTag));
    }

    addVideoAudio = async (videoConsumer, audioConsumer) => {
        const stream = new MediaStream();
        await stream.addTrack(videoConsumer.track);

        if (audioConsumer){
            await stream.addTrack(audioConsumer.track);
        }

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

    closeIframe = () => {
        this.setState({objects : 0});
        document.getElementById("character-layer").style.removeProperty("background-color");
    }

    youtubeClose = () => {
        this.setState({objects : 0})
        this.updatePositionSocketOn()
        document.getElementById("character-layer").style.removeProperty("background-color");
    }

    // toggleChat = () => { //! 기존에 있던 toggleChat은  toggleButton/toggleButton.js로 갔어요
    //     const chatBox = document.getElementById("chat-box");
    //     // if 
    //     // chatBox.setAttribute("display", "none");
    // }

    guidanceOnOff = () => {
        if (this.state.guidance){
            this.setState({guidance:false});
         }
         else{
             this.setState({guidance:true});
         }
    }

<<<<<<< HEAD
    joinMafiaGame = async () => {
        /* MG-01. 마피아 게임 창을 띄운다 */

        /* MG-02. 마피아 게임을 위한 socket 세팅을 완료하고 게임 참여를 알린다 */
        await this.initMafiaGame();     // 마피아 게임을 위한 socket on
        socket.emit("joinMafiaGame");   // 게임 참여 알림
    }

    initMafiaGame = async () =>{
        /* MG-05. 신규 플레이어의 비디오를 추가한다 */
        socket.on("addNewPlayer", (socketId) => {
            /* 전달 받은 player의 비디오 UI 수정 socketId는 newPlayer의 socket.id */
        });
        /* MG-07. 마피아 게임 플레이어 목록을 받아서 게임 화면에 플레이어 비디오를 보여준다*/
        socket.on("sendCurrentPlayers", (players) => {
            /* 전달 받은 player의 비디오 UI 수정, players는 socketId가 들어있는 배열 */
        });
        /* MG-10. 마피아 게임을 위한 정보를 수신하고 투표 시작 */
        socket.on("sendRole", (role) => {
            // 자기 역할 저장 및 직업 확인 팝업
            // 회의 시작
        });
        /* MG-15. 생사 투표 진행 */
        socket.on("sendCitizenCandidationVoteResult", (socketId) => {
            /* TODO: 생사 투표 진행 */
            // 결과 전달은 sendLiveOrDie 함수를 통해
        });

        /* MG-18. 생사 투표 결과 확인 및 Night 턴 전환 */
        socket.on("confirmLiveOrDie", (results) => {

            
            /* TODO: NightTurn 진행 할 경우 팝업 등 화면 전환 구현 */

            socket.emit("startNight");
        });

        /* MG-20. 역할별 동작 수행 */
        socket.on("doAction", () => {
            /* 각 역할 별 화면 구성하기 */
            /* 선택 및 확정은 시민 투표와 동일 */
        });
        /* MG-25. 게임 종료 시 결과 화면 출력 */
        socket.on("gameOver", () => {
            
        });
    }

    startMafiaGame = async () => {
        /* MG-08. 마피아 게임 start 버튼 클릭할 때 실행되어 서버에 게임 시작 이벤트 전달 후 대기
         * TODO: 2명 이하 일 경우 start 할 수 없도록 처리 */
        socket.emit("startMafiaGame");
    }

    sendCandidate = () => {
        /* MG-11. 투표 턴에서 후보 선택 정보 전달 */
        /* MG-21. Night 턴에서 각 역할군이 지정한 후보 전달 */
        /* TODO: 비디오를 선택하면 해당 비디오의 id(socketId) 를 서버에 전달 */
        // socket.emit("sendCandidate", candidateSocketId);
    }

    confirmCandidate = () => {
        /* MG-13. 투표 턴에서 후보 확정 정보 전달 */
        /* MG-23. Night 턴에서 후보 확정 정보 전달 */
        socket.emit("confirmCandidate");
        /* TODO: sendCandidate 불가능 하도록 처리 */
    }

    sendLiveOrDie = () => {
        /* MG-16. 생사 투표 전달 */
        // socket.emit("sendLiveOrDie", liveOrDie);
=======
    screenShare = async () => {
        let screenAudio = false;

        localScreen = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        screenVideoProducer = await sendTransport.produce({
            track: localScreen.getVideoTracks()[0],
            encodings: [
                {maxBitrate: 100000},
                {maxBitrate: 500000}
            ],
            appData: {mediaTag: 'screen-video'}
        });

        //------------------DEBUG 조건문 필요한지? ---------------
        if (localScreen.getAudioTracks().length) {
            console.log('get audio!')
            screenAudioProducer = await sendTransport.produce({
                track: localScreen.getAudioTracks()[0],
                appData: {mediaTag: 'screen-audio'}
            });
            screenAudio = true;
        }
        //------------------DEBUG---------------

        socket.emit('screenShare', screenAudio);
        
        this.pauseProducer(audioProducer, 'cam-audio')
        this.pauseProducer(videoProducer, 'cam-video')

        const localVideo = document.getElementById("localVideo")
            localVideo.srcObject = localScreen;

            screenVideoProducer.track.onended = async () => {
            console.log('screen share stopped');
            localVideo.srcObject = localStream;

            await socket.request('closeProducer', { producerId: screenVideoProducer.id })
            this.closeProducer(screenVideoProducer)
            if (screenAudio){
                await socket.request('closeProducer', { producerId: screenAudioProducer.id })
                this.closeProducer(screenAudioProducer)
            }
            screenVideoProducer = null;
            screenAudioProducer = null;

            socket.emit('endScreenShare-signal', screenAudio);
            this.resumeProducer(audioProducer, 'cam-audio')
            this.resumeProducer(videoProducer, 'cam-video')
            //!--------------screenshare 끝나고 원래대로 돌아오는 코드 넣으면 됨-----
            //! local 바꿀건지?? 
        }
>>>>>>> screenshare
    }

    render() {
        let youtubePage;
        if (this.state.objects === 1){
            youtubePage = <YoutubeMain 
                socket={this.props.socket}
                curr_space={curr_space}
                youtube={uuuuu} 
                updatePositionSocketOn={this.updatePositionSocketOn}
                updatePositionSocketOff={this.updatePositionSocketOff}
                close={this.closeIframe}
                />
        }
        let youtubeVideo;
        if (this.state.objects === 2){
            youtubeVideo = <YoutubeIframe 
                updatePositionSocketOff={this.updatePositionSocketOff}
                closeButton={this.youtubeClose} />
        }
        let iframeRender;
        if (this.state.objects === 3) {
          iframeRender = <IframePage  
            closeIframe={this.closeIframe} 
            updatePositionSocketOn={this.updatePositionSocketOn}
            updatePositionSocketOff={this.updatePositionSocketOff}
          />
        } 
        
        if (this.state.objects === 4) {
            youtubePage = <YoutubeMain 
                socket={this.props.socket}
                curr_space={curr_space}
                youtube={uuuuu} 
                updatePositionSocketOn={this.updatePositionSocketOn}
                updatePositionSocketOff={this.updatePositionSocketOff}
                close={this.closeIframe}
                />
        }
        let youtubeMusic;
        if (this.state.objects === 5){
            youtubeMusic = <div><div className="player2" id="player2"></div></div>
        }

        let guidance;
        if (this.state.guidance) guidance = <Guidance/> 
        else guidance = <></>

        return (
          
            <div className="room" id="room">
                {guidance}
                {iframeRender}
                <div className="youtubePage">{youtubePage}</div>
                {youtubeVideo}
                {youtubeMusic}
                <div className="video-box">
                    <div id="videos" className="video-container"></div>
                </div>
                <div className="local-video-box">
                    <ToggleButton guidanceOnOff ={this.guidanceOnOff} />
                    <video id="localVideo" autoPlay muted></video>
                    <div className="setting-container">
                        {/* <button id="muteButton" className="settings" onClick={this.toggleMute}>Unmuted</button>
                        <button id="vidButton" className="settings" onClick={this.toggleVid}>Video Enabled</button> */}
                    </div>
                </div>
                <div className="chat-box" id="chat-box">
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
                        <input autoComplete="off" type="text" id="chat-message" maxLength='140'/>
                        <button onClick={this.sendChat}>✉</button>
                    </div>
                </div>
            </div>
        );
    }
}

// const chatBox = () => {
    
// }

export default Room;
