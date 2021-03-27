'use strict';

const uuid = require('uuid');
const Room = require('./Class/Room');
const User = require('./Class/User');
const config = require('../config');
const mediasoup = require('mediasoup');
//----------------------add----------------------
const os = require('os');
const Logger = require('./Logger');

let nextMediasoupWorkerIdx = 0;
//----------------------add----------------------

class RoomManager{   // Room 함수 실행
    static roomByName = {};
    static roomByUser = {};
    static io = undefined;
    static workers = [];

    constructor() {
    }

    static async init(io){
        this.io = io
        //----------------------add----------------------
        await initializeMediasoupWorker(this.workers);
        //----------------------add----------------------
        return;
    }

    /* 새로운 Room을 생성 */
    static async createRoom(map){
        console.log("createRoom");
        // console.log(map);
        /* uuid 로 roomName 생성 */
        const tokens = uuid.v4().split('-');
        const roomName = tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
        console.log("********** createRoom ***********");
        // console.log(`localhost?room=${roomName}`);
        /* roomName으로 새로운 Room을 생성하여 rooms에 추가 */
        const room = new Room(roomName, map);
        this.roomByName[roomName] = room;

        const mediaCodecs = config.mediasoup.router.mediaCodecs;
        //----------------------add----------------------
        let worker = getMediasoupWorker(this.workers);
        if (worker == null)
        {
            console.log('All worker is accupied!')
            return; 
        }
        let mediasoupRouter = await worker.createRouter({ mediaCodecs });
        worker.appData.numRouters += 1;
        //----------------------add----------------------
        room.router = mediasoupRouter;
        console.log(roomName);

        return roomName;
    }

    /* 전달받은 socket으로 User를 생성하여 roomName에 해당하는 Room에 User를 추가 */
    static async addSocketToRoom(socket, room){
        const user = new User(socket);
        /* Room에 User 추가 */
        room.addUser(user);
        /* users 배열에 user.socket.id를 key로 하는 value 값을 roomName으로 설정*/
        this.roomByUser[user.socket.id] = room;
        /* user를 roomName에 해당하는 Room 추가 */
        socket.join(room.name);
        if (room.memberCount === 1){
            console.log("------------addSocketToRoom-- 룸 스타트 ----------------------------------------------")
            room.start(this.io);
        }
        return;
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
//----------------------add----------------------
async function initializeMediasoupWorker(workers) {
    const numWorkers = Object.keys(os.cpus()).length;

    for (let i = 0; i < numWorkers; ++i)
    {
        const worker = await mediasoup.createWorker(
            {
                logLevel   : config.mediasoup.worker.logLevel,
                logTags    : config.mediasoup.worker.logTags,
                rtcMinPort : Number(config.mediasoup.worker.rtcMinPort),
                rtcMaxPort : Number(config.mediasoup.worker.rtcMaxPort),
                appData : { numRouters: 0}
            });

        worker.on('died', () =>
        {
            logger.error(
                'mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);

            setTimeout(() => process.exit(1), 2000);
        });

        workers.push(worker);

        // Log worker resource usage every X seconds.
        setInterval(async () =>
        {
            const usage = await worker.getResourceUsage();

            logger.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
        }, 120000);
    }
  }

function getMediasoupWorker(workers)
{
    let worker = workers[nextMediasoupWorkerIdx];
    const first_num = nextMediasoupWorkerIdx;

    while (worker.appData.numRouters >= 3){
        worker = workers[++nextMediasoupWorkerIdx]

        if (++nextMediasoupWorkerIdx === workers.length)
            nextMediasoupWorkerIdx = 0;
        if (nextMediasoupWorkerIdx === first_num)
            return null;
    }
    if (++nextMediasoupWorkerIdx === workers.length)
            nextMediasoupWorkerIdx = 0;
    console.log(worker.pid)
    return worker;
}
//----------------------add----------------------

module.exports = RoomManager;
