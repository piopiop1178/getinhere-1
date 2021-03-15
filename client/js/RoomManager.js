function RoomManager(io, SETTINGS) {
    var RmMg = this;

    RmMg.rooms = {};

    RmMg.create = function(socket) {
        const roomName = socket.id;
        var room = new Room(roomName, socket);
        room.peers[socket.id] = socket;
        socket.join(roomName);
        
        RmMg.rooms[roomName] = room;

        console.log('Room Created :', roomName);
    };

    RmMg.join = function(socket, room) {
        socket.leave(socket.id);
        socket.join(room.name);
        room.players.push(socket);
        room.objects[socket.id] = new UserObject(socket.id);
        room.peers[socket.id] = socket;
        console.log('Joined room :', room.name);
    }

    RmMg.disconnect = function(socket) {
        var roomName = RmMg.findRoomName(socket);
        if (roomName === null) {
            console.log("error : can't find socket in Room");
            return;
        }
        var players = RmMg.rooms[roomName].players;
        const playerindex = players.findIndex(function(player) {
            return player.id === socket.id
        });
        if (playerindex > -1) {
            players.splice(playerindex, 1);
        } else {
            console.log("error : can't find socket in Room");
            return;
        }
        delete RmMg.rooms[roomName].objects[socket.id];
        delete RmMg.rooms[roomName].peers[socket.id];
    }

    //TODO compare socket.id and key in objects
    RmMg.findRoomName = function(socket) {
        let roomName = null;
        let roomList = Object.values(RmMg.rooms);
        roomList.some(function(room, index) {
            for (var object in room.objects) {
                var obj = room.objects[object];
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
            var statuses = [];
            for (var object in room.objects) {
                var obj = room.objects[object];
                
                let col, row;
                if (obj.keypress[LEFT]) {
                    col = pixelToTile(obj.status.x - TILE_LENGTH);
                    row = pixelToTile(obj.status.y);
                    if (!checkBitmap(BITMAP, row, col)) {
                        obj.status.x = obj.status.x - TILE_LENGTH < 0 ? obj.status.x : obj.status.x - TILE_LENGTH;
                    }
                }
                if (obj.keypress[UP]) {
                    col = pixelToTile(obj.status.x);
                    row = pixelToTile(obj.status.y - TILE_LENGTH);
                    if (!checkBitmap(BITMAP, row, col)) {
                        obj.status.y = obj.status.y - TILE_LENGTH < 0 ? obj.status.y : obj.status.y - TILE_LENGTH;
                    }
                }
                if (obj.keypress[RIGHT]) {
                    col = pixelToTile(obj.status.x + TILE_LENGTH);
                    row = pixelToTile(obj.status.y);
                    if (!checkBitmap(BITMAP, row, col)) {
                        obj.status.x = obj.status.x + 2 * TILE_LENGTH > WIDTH ? obj.status.x : obj.status.x + TILE_LENGTH;
                    }
                }
                if (obj.keypress[DOWN]) {
                    col = pixelToTile(obj.status.x);
                    row = pixelToTile(obj.status.y + TILE_LENGTH);
                    if (!checkBitmap(BITMAP, row, col)) {
                        obj.status.y = obj.status.y + 2 * TILE_LENGTH > HEIGHT ? obj.status.y : obj.status.y + TILE_LENGTH;
                    }
                }
                var status_pair = {status : obj.status, id : obj.id};
                statuses.push(status_pair);
            }
            io.to(room.name).emit('update', statuses);
        });
    }, 50);
}

const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
const CHAR_SIZE = 60

function UserObject(id) {

    var color = '#';
    for (var i = 0; i < 6; i++) {
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

function Room(name, player) {
    this.name = name;
    this.status = "waiting";
    this.players = [player];
    this.peers = {};
    this.objects = {};
    this.objects[player.id] = new UserObject(player.id);
}

const TILE_LENGTH = 60, TILE_WIDTH = 7, TILE_HEIGHT = 5;
const WIDTH = TILE_LENGTH * TILE_WIDTH
const HEIGHT = TILE_LENGTH * TILE_HEIGHT

// let BITMAP = 1<<9 | 1<<11 | 1<<20 | 1<<25 | 1<<31;
let BITMAP_array = [9, 11, 20, 25, 31] //! dummy data

let BITMAP = arrayToBitmap(BITMAP_array);

function dec2bin(num) {
    return (num >>> 0).toString(2);
}

function checkBitmap(bitmap, row, col) { // �߸��� �̵��̸� true�� return�Ѵ�
    let target = convertLocToNum(row, col)

    let bin = dec2bin(bitmap);
    if (bin [ bin.length-1 - target] == 1) {
        // console.log(bin [ bin.length-1 - target]);
        return true;
    } else {
        return false;
    }
}

function findAllIndex(string, char) { //! �ش��ϴ� arr�� �������ݴϴ�. 
    let arr = [];
    for (let i = 0; i < string.length; i++) {
      if (string[i] == char) {
        arr.push(i);
      }
    }
    return arr;
}

function pixelToTile(pixel) {
    let tile = pixel/TILE_LENGTH + 1;
    return tile;
}

function tileToPixel(tile) { 
    let pixel = (tile-1)*TILE_LENGTH;
    return pixel;
}

function convertLocToNum(row, col) {
    let target = ((row - 1) * (TILE_WIDTH) + (col))
    return target;
}

function convertNumToTileRowCol(num) {
    let arr = []
    // let row = parseInt(num / TILE_WIDTH) + 1
    let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
    let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
    arr[0] = row
    arr[1] = col
    return arr;
}

function convertNumToPixelXY(num) {
    let arr = convertNumToTileRowCol(num);
    let x = tileToPixel(arr[1]); // x = col
    let y = tileToPixel(arr[0]); // y = row
    return [x, y];
}

function arrayToBitmap(arr) {
    let bitmap = 0
    for(let i=0; i<arr.length; i++) {
        bitmap += 1<<(arr[i]);
    }
    return bitmap;
}

function bitmapToArray(bitmap) {
    let bin = dec2bin(bitmap);
    let reversed_arr = findAllIndex(bin, 1);
    return reversed_arr.map(x=> bin.length-1-x);
}

module.exports = RoomManager;
