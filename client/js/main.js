let socket;
let localStream = null;
/**
 * All peer connections
 */
let peers = {}

let tile = new Image();
tile.src = "../image/tile2.jpg";
// redirect if not https
// if(location.href.substr(0,5) !== 'https') 
//     location.href = 'https' + location.href.substr(4, location.href.length - 4)


//////////// CONFIGURATION //////////////////

/**
 * RTCPeerConnection configuration 
 */
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

constraints.video.facingMode = {
    ideal: "user" 
}

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    console.log('Received local stream');

    localVideo.srcObject = stream;
    localStream = stream;
    init()
}).catch(e => alert(`getusermedia error ${e.name}`))

function init() {
    
    var query_param = get_query();
    console.log(query_param);
    socket = io("/", { query: query_param })

    let GAME_SETTINGS = null;
    const LEFT = 'ArrowLeft', UP = 'ArrowUp', RIGHT = 'ArrowRight', DOWN = 'ArrowDown';

    const canvasBackground = document.createElement("canvas");
    const contextBackground = canvasBackground.getContext("2d");
    canvasBackground.id = "background-layer";

    const canvasObject = document.createElement("canvas");
    const contextObject = canvasObject.getContext("2d");
    canvasObject.id = "object-layer";

    const canvasCharacter = document.createElement("canvas");
    const contextCharacter = canvasCharacter.getContext("2d");
    canvasCharacter.id = "character-layer";

    const body = document.querySelector('body')

    // 캐릭터 이미지
    let among = new Image();
    among.src = "../image/among.jpg";

    let icon = new Image();
    // tmp 3.18(목) 발표를 위한 더미데이터. 랜덤으로 캐릭터 생성 및 blocked_area 그림데이터
    let charNameList = ['icon.png', 'char_snowman.png', 'char_snowman2.png','char_woman1.png', 'char_woman2.png']
    // icon.src = "../image/icon.png";
    icon.src = `../image/${charNameList[Math.floor(Math.random()*charNameList.length)]}`;
    // tmp

    body.addEventListener('keydown' ,(e)=> {/*��????? 3.12*/
        let st = localStorage.getItem('myStatus');
        let parsed_status = JSON.parse(st);
        let curr_x = parsed_status.x;
        let curr_y = parsed_status.y;
        socket.emit('keydown', e.code);
        if(e.code == RIGHT) e.preventDefault();
        if(e.code == LEFT)  e.preventDefault();
        if(e.code == DOWN)  e.preventDefault();
        if(e.code == UP)    e.preventDefault();
    })
    body.addEventListener("keyup", function (e) {
        socket.emit("keyup", e.code);
    });
    socket.on("connected", function (SERVER_GAME_SETTINGS) {
        GAME_SETTINGS = SERVER_GAME_SETTINGS;

        canvasBackground.setAttribute("width", GAME_SETTINGS.WIDTH);
        canvasBackground.setAttribute("height", GAME_SETTINGS.HEIGHT);
        document.body.appendChild(canvasBackground);

        canvasObject.setAttribute("width", GAME_SETTINGS.WIDTH);
        canvasObject.setAttribute("height", GAME_SETTINGS.HEIGHT);
        document.body.appendChild(canvasObject);

        canvasCharacter.setAttribute("width", GAME_SETTINGS.WIDTH);
        canvasCharacter.setAttribute("height", GAME_SETTINGS.HEIGHT);
        document.body.appendChild(canvasCharacter);

        localStorage.setItem('BLOCKED_AREA', GAME_SETTINGS.BLOCKED_AREA);
        TILE_LENGTH = GAME_SETTINGS.TILE_LENGTH
        TILE_WIDTH = GAME_SETTINGS.TILE_WIDTH
        TILE_HEIGHT = GAME_SETTINGS.TILE_HEIGHT
        CHAR_SIZE = GAME_SETTINGS.CHAR_SIZE
        WIDTH = GAME_SETTINGS.WIDTH
        HEIGHT = GAME_SETTINGS.HEIGHT

        drawBackground(contextBackground, GAME_SETTINGS, tile);
        drawBlockZone(localStorage.getItem('BLOCKED_AREA').split(','), contextObject);
    });
    // socket.on("update", function (statuses) {
    socket.on("update", function (statuses, idArray) {
        if (GAME_SETTINGS == null) return;
        storelocalStorage(statuses[socket.id].status);
        updateWindowCenter(statuses[socket.id].status);

        contextCharacter.clearRect(0, 0, WIDTH, HEIGHT);
        contextCharacter.beginPath();
        idArray.forEach(function (id) {
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
        for (let socket_id in peers) { //�迭 for in �ϸ� index�� ������.
            removePeer(socket_id)
        }
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
    })

    // --------------------------------------------------------------
}

/**
 * Remove a peer with given socket_id. 
 * Removes the video element and deletes the connection
 * @param {String} socket_id 
 */
function removePeer(socket_id) {

    let videoEl = document.getElementById(socket_id)
    if (videoEl) {

        const tracks = videoEl.srcObject.getTracks();

        tracks.forEach(function (track) { //forEach() �־��� �Լ��� �迭 ���? ������ ���� ����
            track.stop()
        })

        videoEl.srcObject = null
        console.log('removePeer test@@@@@');
        videoEl.parentNode.removeChild(videoEl)
    }
    if (peers[socket_id]) peers[socket_id].destroy() //destroy�� remove??? 
    delete peers[socket_id]
}

/**
 * Creates a new peer connection and sets the event listeners
 * @param {String} socket_id 
 *                 ID of the peer
 * @param {Boolean} am_initiator 
 *                  Set to true if the peer initiates the connection process.
 *                  Set to false if the peer receives the connection. 
 */
function addPeer(socket_id, am_initiator) {
    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        stream: localStream,
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
        newVid.playsinline = false
        newVid.autoplay = true
        newVid.className = "vid"
        newVid.onclick = () => openPictureMode(newVid)
        newVid.ontouchstart = (e) => openPictureMode(newVid)
        videos.appendChild(newVid)
    })
}

/**
 * Opens an element in Picture-in-Picture mode
 * @param {HTMLVideoElement} el video element to put in pip mode
 */
function openPictureMode(el) {
    console.log('opening pip') //pip���? 
    el.requestPictureInPicture()
}

/**
 * Switches the camera between user and environment. It will just enable the camera 2 cameras not supported.
 */
function switchMedia() {
    if (constraints.video.facingMode.ideal === 'user') {
        constraints.video.facingMode.ideal = 'environment'
    } else {
        constraints.video.facingMode.ideal = 'user'
    }

    const tracks = localStream.getTracks();

    tracks.forEach(function (track) {
        track.stop()
    })

    localVideo.srcObject = null
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {

        for (let socket_id in peers) {
            for (let index in peers[socket_id].streams[0].getTracks()) {
                for (let index2 in stream.getTracks()) {
                    if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                        peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                        break;
                    }
                }
            }
        }

        localStream = stream
        localVideo.srcObject = stream

        updateButtons()
    })
}

/**
 * Enable screen share
 */
function setScreen() {
    navigator.mediaDevices.getDisplayMedia().then(stream => {
        for (let socket_id in peers) {
            for (let index in peers[socket_id].streams[0].getTracks()) {
                for (let index2 in stream.getTracks()) {
                    if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                        peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                        break;
                    }
                }
            }

        }
        localStream = stream

        localVideo.srcObject = localStream
        // socket.emit('removeUpdatePeer', '')
    })
    updateButtons()
}

/**
 * Disables and removes the local stream and all the connections to other peers.
 */
function removeLocalStream() {
    if (localStream) {
        const tracks = localStream.getTracks();

        tracks.forEach(function (track) {
            track.stop()
        })

        localVideo.srcObject = null
    }

    for (let socket_id in peers) {
        removePeer(socket_id)
    }
}

/**
 * Enable/disable microphone
 */
function toggleMute() {
    for (let index in localStream.getAudioTracks()) {
        localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}
/**
 * Enable/disable video
 */
function toggleVid() {
    for (let index in localStream.getVideoTracks()) {
        localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
}

/**
 * updating text of buttons
 */
function updateButtons() {
    for (let index in localStream.getVideoTracks()) {
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
    for (let index in localStream.getAudioTracks()) {
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}

function get_query() {
    var url = document.location.href;
    var qs = url.substring(url.indexOf("?") + 1).split("&");
    for (var i = 0, result = {}; i < qs.length; i++) {
        qs[i] = qs[i].split("=");
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
}

function storelocalStorage(myStatus) {/*��????? 3.12*/
    localStorage.setItem('myStatus', JSON.stringify(myStatus));
    let row = myStatus.y/TILE_LENGTH + 1;
    let col = myStatus.x/TILE_LENGTH + 1;
    localStorage.setItem('position', JSON.stringify({row, col}))
}

function updateWindowCenter(myStatus) {
    window.scrollTo(myStatus.x - window.innerWidth/2  + TILE_LENGTH/2 , myStatus.y - window.innerHeight/2 + TILE_LENGTH/2 )
}

function drawBackground(contextBackground, GAME_SETTINGS, tile) {
    // 배경 이미지
    // let backgroundImage = new Image();
    // backgroundImage.src = "../image/back.jpg";
    // ctx.drawImage(backgroundImage, 0, 0, GAME_SETTINGS.WIDTH, GAME_SETTINGS.HEIGHT);

    // 배경 타일
    console.log(tile);
    for(let y = 0; y < GAME_SETTINGS.HEIGHT; y += TILE_LENGTH){
        for(let x = 0; x < GAME_SETTINGS.WIDTH; x += TILE_LENGTH){
                contextBackground.drawImage(tile, x, y, TILE_LENGTH, TILE_LENGTH);
        };
    };


    // 배경 타일
    // let backgroundTile = new Image();
    // backgroundTile.src = "../image/tile.jpg";
    // contextBackground.fillStyle = "yellow";
    // for(let y = 0; y < GAME_SETTINGS.HEIGHT; y += TILE_LENGTH){
    //     for(let x = 0; x < GAME_SETTINGS.WIDTH; x += TILE_LENGTH){
    //         contextBackground.fillRect(x, y, TILE_LENGTH, TILE_LENGTH);
    //     };
    // };


    // let img = new Image();
    // img.onload = function() {
    //     let pattern = contextBackground.createPattern(img, 'repeat');
    //     contextBackground.fillStyle = pattern;
    //     contextBackground.fillRect(0, 0, GAME_SETTINGS.WIDTH, GAME_SETTINGS.HEIGHT);
    // };
    // img.src = '../image/tile.jpg';


    // contextBackground.fillStyle = "yellow";
    // for(let y = 0; y < GAME_SETTINGS.HEIGHT; y += TILE_LENGTH){
    //     for(let x = 0; x < GAME_SETTINGS.WIDTH; x += TILE_LENGTH){
    //         contextBackground.fillRect(x, y, TILE_LENGTH, TILE_LENGTH);
    //     }
    // }
}

convertNumToTileRowCol = function(num) {
    let arr = []
    // let row = parseInt(num / TILE_WIDTH) + 1
    let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
    let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
    arr[0] = row
    arr[1] = col
    return arr;
}

function drawBlockZone(area, ctx_obj) { //todo bitmap?�� 받는�? ?��?��?�� array�? 받는?���? ?��각하?��.
    let arr = area;
    for(let i =0; i< arr.length; i++) {
        let tile_row_col = convertNumToTileRowCol(arr[i]) 
        let pixel_x = (tile_row_col[1] - 1) * TILE_LENGTH;
        let pixel_y = (tile_row_col[0] - 1) * TILE_LENGTH;
        ctx_obj.fillStyle = "black";
        ctx_obj.fillRect(pixel_x, pixel_y, TILE_LENGTH, TILE_LENGTH);
    }
}
