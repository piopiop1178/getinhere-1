const uuid = require('uuid')

function RoomManager(io, SETTINGS) {
    const LEFT = 'ArrowLeft', UP = 'ArrowUp', RIGHT = 'ArrowRight', DOWN = 'ArrowDown';
    TILE_LENGTH = SETTINGS.TILE_LENGTH
    TILE_WIDTH = SETTINGS.TILE_WIDTH
    TILE_HEIGHT = SETTINGS.TILE_HEIGHT
    CHAR_SIZE = SETTINGS.CHAR_SIZE
    WIDTH = SETTINGS.WIDTH;
    HEIGHT = SETTINGS.HEIGHT;
    BLOCKED_AREA = SETTINGS.BLOCKED_AREA

    let RmMg = this;

    RmMg.rooms = {};

    RmMg.create = function(socket) {
        const tokens = uuid.v4().split('-');
        const roomName = tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
        let room = new Room(roomName, socket);
        room.players[socket.id] = socket;
        // room.peers[socket.id] = socket;
        socket.join(roomName);
        
        RmMg.rooms[roomName] = room;

        console.log('Room Created :', roomName);
    };

    RmMg.join = function(socket, room) {
        // socket.leave(socket.id);
        socket.join(room.name);
        // room.players.push(socket);
        room.players[socket.id] = socket;
        room.objects[socket.id] = new UserObject(socket.id);
        // room.peers[socket.id] = socket;
        console.log('Joined room :', room.name);
    }

    RmMg.disconnect = function(socket) {
        let roomName = RmMg.findRoomName(socket);
        if (roomName === null) {
            console.log("error : can't find socket in Room");
            return;
        }
        let players = RmMg.rooms[roomName].players;
        const playername = socket.id;
        // const playerindex = players.findIndex(function(player) {
        //     return player.id === socket.id
        // });
        if (players[playername]) {
            delete players[playername];
            //need destroy?? 

            // players.splice(playerindex, 1);
        } else {
            console.log("error : can't find socket in Room");
            return;
        }
        delete RmMg.rooms[roomName].objects[socket.id];
        // delete RmMg.rooms[roomName].peers[socket.id];
    }

    //TODO compare socket.id and key in objects
    RmMg.findRoomName = function(socket) {
        let roomName = null;
        let roomList = Object.values(RmMg.rooms);
        roomList.some(function(room, index) {
            for (let object in room.objects) {
                let obj = room.objects[object];
                if (obj.id == socket.id) {
                    roomName = room.name;
                    return true;
                }
            }
        });
        return roomName;
    };
    
    //TODO delete the room when no socket exist

    RmMg.update = setInterval(function() {
        let roomList = Object.values(RmMg.rooms);
        roomList.forEach(function(room) {
            // let statuses = [];
            let idArray = []; 
            let statuses = {};
            for (let object in room.objects) {
                let obj = room.objects[object];
                
                let col, row;
                if (obj.keypress[LEFT]) {
                    col = SETTINGS.pixelToTile(obj.status.x - TILE_LENGTH);
                    row = SETTINGS.pixelToTile(obj.status.y);
                    if (!SETTINGS.checkBlockMap(BLOCKED_AREA, row, col)) {
                        obj.status.x = obj.status.x - TILE_LENGTH < 0 ? obj.status.x : obj.status.x - TILE_LENGTH;
                    }
                }
                if (obj.keypress[UP]) {
                    col = SETTINGS.pixelToTile(obj.status.x);
                    row = SETTINGS.pixelToTile(obj.status.y - TILE_LENGTH);
                    if (!SETTINGS.checkBlockMap(BLOCKED_AREA, row, col)) {
                        obj.status.y = obj.status.y - TILE_LENGTH < 0 ? obj.status.y : obj.status.y - TILE_LENGTH;
                    }
                }
                if (obj.keypress[RIGHT]) {
                    col = SETTINGS.pixelToTile(obj.status.x + TILE_LENGTH);
                    row = SETTINGS.pixelToTile(obj.status.y);
                    if (!SETTINGS.checkBlockMap(BLOCKED_AREA, row, col)) {
                        obj.status.x = obj.status.x + 2 * TILE_LENGTH > WIDTH ? obj.status.x : obj.status.x + TILE_LENGTH;
                    }
                }
                if (obj.keypress[DOWN]) {
                    col = SETTINGS.pixelToTile(obj.status.x);
                    row = SETTINGS.pixelToTile(obj.status.y + TILE_LENGTH);
                    if (!SETTINGS.checkBlockMap(BLOCKED_AREA, row, col)) {
                        obj.status.y = obj.status.y + 2 * TILE_LENGTH > HEIGHT ? obj.status.y : obj.status.y + TILE_LENGTH;
                    }
                }
                let status_pair = {status : obj.status, id : obj.id};

                idArray.push(obj.id);
                statuses[obj.id] = status_pair;
            }
            io.to(room.name).emit('update', statuses, idArray);
        });
    }, 50);
}

function UserObject(id) {

    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += (Math.floor(Math.random()*16)).toString(16);
    }
    this.status = {};
    this.status.x = Math.floor(Math.random()*TILE_WIDTH)*TILE_LENGTH;
    this.status.y = Math.floor(Math.random()*TILE_HEIGHT)*TILE_LENGTH;
    this.status.height = CHAR_SIZE;
    this.status.width = CHAR_SIZE;
    this.status.color = color;
    this.keypress = [];

    this.id = id;
}

function Room(name, player) { // TODO 어떤 map을 사용하고 있는지 정보 저장해두기
    this.name = name;
    this.status = "waiting";
    this.players = {}
    this.players[player.id] = player
    this.objects = {};
    this.objects[player.id] = new UserObject(player.id);
    //TODO map information
}

module.exports = RoomManager;
