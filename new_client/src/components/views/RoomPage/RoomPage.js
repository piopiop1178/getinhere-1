import React, {Component} from 'react';
import {io} from 'socket.io-client';
import './roomPage.css'
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
const socket = io("https://localhost", {transport: ['websocket']}) //! 얘는 뭔가요


let localStream = null;
let peers = {}
let audioctx
let gains = {}
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




    componentDidMount() {
        socket.emit('start', document.location.pathname.slice(6))

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
        let localVideo = document.querySelector('#localVideo');
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            localVideo.srcObject = stream;
            localStream = stream;
            init()
        }).catch(e => alert(`getusermedia error ${e.name}`))

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


            function init() {
                let query_param = get_query();
                console.log('roomPage.js function init()',query_param);
                //Todo: after make main page, add url
                // socket = io("/room", { query: query_param }) //! 얘는 뭔가요
            
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
                socket.on('initReceive', socket_id => {
                    console.log('INIT RECEIVE ' + socket_id)
                    // addPeer(socket_id, false)
            
                    socket.emit('initSend', socket_id)
                })
            
                socket.on('initSend', socket_id => {
                    console.log('INIT SEND ' + socket_id)
                    // addPeer(socket_id, true)
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
            
            function removePeer(socket_id) {
            
                let videoEl = document.getElementById(socket_id)
                if (videoEl) {
            
                    const tracks = videoEl.srcObject.getTracks();
            
                    tracks.forEach(function (track) { 
                        track.stop()
                    })
            
                    videoEl.srcObject = null
                    // console.log('removePeer test@@@@@');
                    videoEl.parentNode.removeChild(videoEl)
                }
                if (peers[socket_id]) peers[socket_id].destroy() 
                delete peers[socket_id]
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