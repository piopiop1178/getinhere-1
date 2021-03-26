function init() {

    const canvasCharacter = document.createElement("canvas");
    const contextCharacter = canvasCharacter.getContext("2d");
    canvasCharacter.id = "character-layer";

    let charNameList = ['icon.png', 'char_snowman.png', 'char_snowman2.png','char_woman1.png', 'char_woman2.png']
    // icon.src = "../image/icon.png";
    icon.src = `../image/${charNameList[Math.floor(Math.random()*charNameList.length)]}`;
    // tmp

    // Initialize AudioContext
    audioctx = new AudioContext()

    // Initialize distance
    let dist;


    socket.on("connected", function (MAP_SETTINGS, roomName) {
        canvasCharacter.setAttribute("width", MAP_SETTINGS._WIDTH);
        canvasCharacter.setAttribute("height", MAP_SETTINGS._HEIGHT);
        document.body.appendChild(canvasCharacter);
    });
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
}

function removePeer(socket_id) {

    let videoEl = document.getElementById(socket_id)
    if (videoEl) {

        const tracks = videoEl.srcObject.getTracks();

        tracks.forEach(function (track) { 
            track.stop()
        })

        videoEl.srcObject = null
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