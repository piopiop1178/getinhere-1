const { worker } = require('cluster');
const uuid = require('uuid');
const Room = require('./Room');
const User = require('./User');
const config = require('./config');
const mediasoup = require('mediasoup');

class RoomManager{   // Room 함수 실행
    static roomByName = {};
    static roomByUser = {};
    static workers = [];
    static io = undefined;

    constructor() {
    }

    static async init(io){
        this.io = io
        let worker = await createMediasoupWorker();
        this.workers.push(worker);
    }

    /* 새로운 Room을 생성 */
    static async createRoom(map){
        /* uuid 로 roomName 생성 */
        const tokens = uuid.v4().split('-');
        const roomName = tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
        console.log("********** createRoom ***********");
        console.log(`https://13.209.75.25?room=${roomName}`);
        /* roomName으로 새로운 Room을 생성하여 rooms에 추가 */
        const room = new Room(roomName, map);
        this.roomByName[roomName] = room;

        const mediaCodecs = config.mediasoup.router.mediaCodecs;
        
        let worker = this.workers[0];
        let mediasoupRouter = await worker.createRouter({ mediaCodecs });
        room.router = mediasoupRouter;
        return room;
    }

    /* 전달받은 socket으로 User를 생성하여 roomName에 해당하는 Room에 User를 추가 */
    static addSocketToRoom(socket, room){
        const user = new User(socket);
        /* Room에 User 추가 */
        room.addUser(user);
        /* users 배열에 user.socket.id를 key로 하는 value 값을 roomName으로 설정*/
        this.roomByUser[user.socket.id] = room;
        /* user를 roomName에 해당하는 Room 추가 */
        socket.join(room.name);
        if (room.memberCount === 1){
            room.start(this.io);
        }
    }

    /* Room에서 User를 제거 */
    static removeSocketFromRoom(socket){
        /* */
        const room = this.roomByUser[socket.id];
        if (room === undefined){
            console.log("ERROR : removeUserFromRoom, roomName === undefined");
            return;
        }
        room.removeUser(socket);
        delete this.roomByUser[socket.id];

        if(room.isEmpty()){
            this.deleteRoom(room);
        }
    }

    static deleteRoom(room){
        delete this.roomByName[room.name];
    }

    static getSocketsByRoomName(roomName){
        return this.roomByName[roomName].getSockets();
    }

    static getRoomBySocket(socket){
        return this.roomByUser[socket.id];
    }

    static getRoomByRoomName(roomName){
        return this.roomByName[roomName];
    }

    static getRoomNameBySocket(socket){
        return this.roomByUser[socket.id].name;
    }

    static getRouterBySocket(socket){
        return this.roomByUser[socket.id].router;
    }
}

async function createMediasoupWorker() {
    let worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker.logLevel,
      logTags: config.mediasoup.worker.logTags,
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    });
  
    worker.on('died', () => {
      console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
      setTimeout(() => process.exit(1), 2000);
    });
    
    return worker;
    // const mediaCodecs = config.mediasoup.router.mediaCodecs;
    // mediasoupRouter = await worker.createRouter({ mediaCodecs }); //media server create? 
  }

module.exports = RoomManager;
