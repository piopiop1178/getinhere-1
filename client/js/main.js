let socket;
let localStream = null;
let peers = {}

// // let tile = new Image();
// // tile.src = "../image/tile2.jpg";
 
// // let among = new Image();
// // among.src = "../image/among.jpg";

// // let audio = new Audio('../music/all_falls_down.mp3');
// // // let audio_on = false;
// // audio.src = '../music/Redone.mp3';

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

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    // console.log('Received local stream');

    localVideo.srcObject = stream;
    localStream = stream;
    init()
}).catch(e => alert(`getusermedia error ${e.name}`))

function init() {
    
    let query_param = get_query();
    console.log(query_param);
    //Todo: after make main page, add url
    socket = io("/room", { query: query_param }) 

    let MAP_SETTINGS2 = null;
    const LEFT = 'ArrowLeft', UP = 'ArrowUp', RIGHT = 'ArrowRight', DOWN = 'ArrowDown';

    // //! mainPage.js로 갈 내용. Canvas
    // const canvasBackground = document.createElement("canvas");
    // const contextBackground = canvasBackground.getContext("2d");
    // canvasBackground.id = "background-layer";

    // const canvasObject = document.createElement("canvas");
    // const contextObject = canvasObject.getContext("2d");
    // canvasObject.id = "object-layer";

    // const canvasCharacter = document.createElement("canvas");
    // const contextCharacter = canvasCharacter.getContext("2d");
    // canvasCharacter.id = "character-layer";

    // const body = document.querySelector('body')

    // // 캐릭터 이미지
    // let among = new Image();
    // among.src = "../image/among.jpg";

    // let icon = new Image();
    // // tmp 3.18(목) 발표를 위한 더미데이터. 랜덤으로 캐릭터 생성 및 blocked_area 그림데이터
    // let charNameList = ['icon.png', 'char_snowman.png', 'char_snowman2.png','char_woman1.png', 'char_woman2.png']
    // // icon.src = "../image/icon.png";
    // icon.src = `../image/${charNameList[Math.floor(Math.random()*charNameList.length)]}`;
    // tmp
    // END

    // Initialize AudioContext
    audioctx = new AudioContext()

    // Initialize distance
    let dist;

    body.addEventListener('keydown' ,(e)=> {
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
    body.addEventListener("keyup", function (e) {
        socket.emit("keyup", e.code);
    });
    //! mainPage.js로 갈 내용
   // // socket.on("connected", function (MAP_SETTINGS, roomName) {
   // //     MAP_SETTINGS2 = MAP_SETTINGS;

   // //     canvasBackground.setAttribute("width", MAP_SETTINGS._WIDTH);
   // //     canvasBackground.setAttribute("height", MAP_SETTINGS._HEIGHT);
   // //     document.body.appendChild(canvasBackground);

   // //     canvasObject.setAttribute("width", MAP_SETTINGS._WIDTH);
   // //     canvasObject.setAttribute("height", MAP_SETTINGS._HEIGHT);
   // //     document.body.appendChild(canvasObject);

   // //     canvasCharacter.setAttribute("width", MAP_SETTINGS._WIDTH);
   // //     canvasCharacter.setAttribute("height", MAP_SETTINGS._HEIGHT);
   // //     document.body.appendChild(canvasCharacter);

   // //     localStorage.setItem('BLOCKED_AREA', MAP_SETTINGS._BLOCKED_AREA);
   // //     localStorage.setItem('Invite_url', 'https://getinhere.me/?room=' + roomName);
   // //     TILE_LENGTH = MAP_SETTINGS._TILE_LENGTH
   // //     TILE_WIDTH = MAP_SETTINGS._TILE_WIDTH
   // //     TILE_HEIGHT = MAP_SETTINGS._TILE_HEIGHT
   // //     CHAR_SIZE = MAP_SETTINGS._TILE_LENGTH
   // //     WIDTH = MAP_SETTINGS._WIDTH
   // //     HEIGHT = MAP_SETTINGS._HEIGHT

   
   // //     // getTileAndDrawBackground(contextBackground, MAP_SETTINGS);
   // //     drawBackground(contextBackground, MAP_SETTINGS, tile);
   // //     drawBlockZone(localStorage.getItem('BLOCKED_AREA').split(','), contextObject);
   // // });
   // //END

    // socket.on("update", function (statuses) {
    socket.on("update", function (statuses, idArray) {
        if (MAP_SETTINGS2 == null) return;
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
        // console.log('INIT RECEIVE ' + socket_id)
        addPeer(socket_id, false)

        socket.emit('initSend', socket_id)
    })

    socket.on('initSend', socket_id => {
        // console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true)
    })

    socket.on('removePeer', socket_id => {
        // console.log('removing peer ' + socket_id)
        removePeer(socket_id)
    })

    socket.on('disconnect', () => {
        // console.log('GOT DISCONNECTED')
        for (let socket_id in peers) { 
            removePeer(socket_id)
        }
    })

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
    // --------------------------------------------------------------

    socket.on('chat', (name, message) => {
        // console.log(name, message);
        document.getElementById("message-box").appendChild(makeMessageOther(name, message));
        ScrollBottom("message-box");
    });

    // console.log(document.getElementById("chat-message"));
    
    document.getElementById("chat-message").addEventListener("keyup", (e) => {
        // console.log(e.code);
        if(e.code == "Enter"){
            sendChat();
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

function addPeer(socket_id, am_initiator) {
    let newStream = new MediaStream(localStream)
    let newAudioTrack = localStream.getAudioTracks()[0]
    let src = audioctx.createMediaStreamSource(new MediaStream([newAudioTrack]))
    let dst = audioctx.createMediaStreamDestination()
    let gainNode = audioctx.createGain()
    gainNode.gain.value = 0
    gains[socket_id] = gainNode
    ;[src, gainNode, dst].reduce((a, b) => a && a.connect(b))
    newStream.removeTrack(newAudioTrack)
    newStream.addTrack(dst.stream.getAudioTracks()[0])

    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        // stream: localStream,
        stream: newStream,
        config: configuration
    })

    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
        })
    })

    peers[socket_id].on('stream', stream => {
        let newVid = document.createElement('video')
        newVid.srcObject = stream
        newVid.id = socket_id
        // newVid.playsinline = false
        newVid.autoplay = true
        newVid.className = "vid"
        videos.appendChild(newVid)
    })
}

//-------------------------- TODO-----------------------------
// function setScreen() {
//     navigator.mediaDevices.getDisplayMedia().then(stream => {
//         for (let socket_id in peers) {
//             for (let index in peers[socket_id].streams[0].getTracks()) {
//                 for (let index2 in stream.getTracks()) {
//                     if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
//                         peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
//                         break;
//                     }
//                 }
//             }

//         }
//         localStream = stream

//         localVideo.srcObject = localStream
//         // socket.emit('removeUpdatePeer', '')
//     })
//     updateButtons()
// }
//-------------------------- TODO-----------------------------

//------------------------------------------------
// function removeLocalStream() {
//     if (localStream) {
//         const tracks = localStream.getTracks();

//         tracks.forEach(function (track) {
//             track.stop()
//         })

//         localVideo.srcObject = null
//     }

//     for (let socket_id in peers) {
//         removePeer(socket_id)
//     }
// }

function toggleMute() {
    for (let index in localStream.getAudioTracks()) {
        localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}

function toggleVid() {
    for (let index in localStream.getVideoTracks()) {
        localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
}


function updateButtons() {
    for (let index in localStream.getVideoTracks()) {
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
    for (let index in localStream.getAudioTracks()) {
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}

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

function drawBackground(contextBackground, MAP_SETTINGS, tile) {
    // 배경 이미지
    // let backgroundImage = new Image();
    // backgroundImage.src = "../image/back.jpg";
    // ctx.drawImage(backgroundImage, 0, 0, MAP_SETTINGS._WIDTH, MAP_SETTINGS._HEIGHT);

    // 배경 타일
    // console.log(tile);
    for(let y = 0; y < MAP_SETTINGS._HEIGHT; y += TILE_LENGTH){
        for(let x = 0; x < MAP_SETTINGS._WIDTH; x += TILE_LENGTH){
                contextBackground.drawImage(tile, x, y, TILE_LENGTH, TILE_LENGTH);
        };
    };
}

// async function getTileAndDrawBackground(contextBackground, MAP_SETTINGS){
//     try{
//         let tile = getTile();
//         await setTimeout(drawBackground(contextBackground, MAP_SETTINGS, tile), 5000);
//     } catch (error) {
//         console.error(error);
//     }
// }

// function getTile(){
//     const tile = new Image();
//     tile.src = "../image/tile2.jpg";
//     return tile;
// }

convertNumToTileRowCol = function(num) {
    let arr = []
    let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
    let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
    arr[0] = row
    arr[1] = col
    return arr;
}

function drawBlockZone(area, ctx_obj) { 
    let arr = area;
    for(let i =0; i< arr.length; i++) {
        let tile_row_col = convertNumToTileRowCol(arr[i]) 
        let pixel_x = (tile_row_col[1] - 1) * TILE_LENGTH;
        let pixel_y = (tile_row_col[0] - 1) * TILE_LENGTH;
        ctx_obj.fillStyle = "black";
        ctx_obj.fillRect(pixel_x, pixel_y, TILE_LENGTH, TILE_LENGTH);
    }
//--------------------------tmp----------------------
    ctx_obj.drawImage(among, 
        0 * TILE_LENGTH,
        19 * TILE_LENGTH,
        TILE_LENGTH,
        TILE_LENGTH
        );
//--------------------------tmp----------------------
}

function calcDistance(status1, status2) {
    return Math.sqrt(Math.pow((status1.x - status2.x)/CHAR_SIZE, 2) + Math.pow((status1.y - status2.y)/CHAR_SIZE, 2))
}

function sendChat(){
    const name = socket.id;
    const chatMessage = document.getElementById("chat-message");
    const message = chatMessage.value;
    // console.log(message)
    if (message.replace(/^\s+|\s+$/g,"") === ""){
        chatMessage.value = null;
        return;
    }
    document.getElementById("message-box").appendChild(makeMessageOwn(message));
    ScrollBottom("message-box");
    chatMessage.value = null;
    // console.log(name, message);
    socket.emit('chat', name, message);
}

function ScrollBottom(id){
    const element = document.getElementById(id);
    element.scrollTop = element.scrollHeight - element.clientHeight;
 }

function makeMessageOwn(message){
    const messageOwn= document.createElement('div');
    messageOwn.className = "message-own";

    const messageText = document.createElement('div');
    messageText.className = "message-text";
    messageText.appendChild(document.createTextNode(message));

    messageOwn.appendChild(messageText);

    return messageOwn;
}

function makeMessageOther(name, message){
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

function preventReload(){
    // window.onbeforeunload = function(e) {
    //     console.log("!!!!!!!!!!");
    //     return "";
    // };
    // if ((event.ctrlKey == true && (event.keyCode == 78 || event.keyCode == 82)) || (event.keyCode == 116)) {
    //     if(confirm("페이지를 새로고침 하시겠습니까?")){

    //     }
    //     else{
    //         event.keyCode = 0;
    //         event.cancelBubble = true;
    //         event.returnValue = false;
    //     }
    // }
}