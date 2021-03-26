import React, { Component } from 'react';
import io from 'socket.io-client';
const backUrl = 'https://localhost:4433'
const socket = io.connect(`${backUrl}`, {
    transports: ['websocket'],
});

let localStream = null;
let peers = {}

let audio = new Audio('../music/all_falls_down.mp3');

let audioctx
let gains = {}

const configuration = {
    "iceServers": [{
            "urls": "stun:stun.l.google.com:19302"
        },
        // {
        //     url: 'turn:192.158.29.39:3478?transport=udp',
        //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     username: '28224511:1379330808'
        // }
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

    componentDidMount = () => {
        this.setState({
            roomName: this.props.roomName,
            userName: this.props.userName,
            characterNum: this.props.characterNum,
            map: this.props.map,
            characterList: this.props.characterList
        })
        console.log("!!!!!");
        console.log(this.props.characterList);

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            // console.log('Received local stream');
            const localVideo = document.getElementById("localVideo")
            localVideo.srcObject = stream;
            localStream = stream;
        }).catch(e => alert(`getusermedia error ${e.name}`))


        socket.on('test', data => {
            console.log(data);
        });
        socket.emit('test', 'Hello');
        
        socket.on('sendUsers', (users) => {
            for (let socketId in users){
                this.state.users[socketId] = users[socketId];
            }
            let socketId = socket.id
            this.state.users[socketId] = {userName: this.props.userName, characterNum: this.props.characterNum};
            console.log(this.state.users);
        });

        socket.emit('getUsers', this.props.roomName, this.props.userName, this.props.characterNum);

        socket.on('addUser', (socketId, userName, characterNum) => {
            this.state.users[socketId] = {userName: userName, characterNum: characterNum};
            console.log('addUser', this.state.users[socketId].userName);
        });

        socket.on('removeUser', (socketId) => {
            console.log('removeUser', this.state.users[socketId].userName);
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

        audioctx = new AudioContext()

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


    render() {
        return (
            <div className="room" id="room">
                {/* <div className="video-box">
                    <div id="videos" className="video-container"></div>
                </div> */}
                <div className="local-video-box">
                    <div className="toggles">
                        <div className="chat-toggle">📢</div>
                        <div className="invite-toggle">👨‍👩‍👦</div>
                        <div className="invite-toggle-notice"> Invite Link Copied! </div>
                        <div className="etc-toggle">🔧</div>
                    </div>
                    <video id="localVideo" autoPlay muted></video>
                    <div className="setting-container">
                        <button id="muteButton" className="settings" onClick={this.toggleMute}>Unmuted</button>
                        <button id="vidButton" className="settings" onClick={this.toggleVid}>Video Enabled</button>
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