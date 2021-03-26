'use strict';

/* 각 방에 대한 처리를 위한 Class */

class Room { // TODO 어떤 map을 사용하고 있는지 정보 저장해두기
    constructor(name, map){
        this.name = name;
        this.map = map;
        this.memberCount = 0;
        this.users = {};
        this.router;
        this.music = false;
        this.roomState = {
            peers: {},
            transports: {},
            producers: [],
            consumers: []
        }
    }

    get router(){
        return this._router;
    }
    set router(value){
        this._router = value;
    }
    
    get roomState(){
        return this._roomState;
    }
    set roomState(value){
        this._roomState = value;
    }

    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }

    get map(){
        return this._map;
    }
    set map(value){
        this._map = value;
    }

    get users(){
        return this._users;
    }
    set users(value){
        this._users = value;
    }

    get memberCount(){
        return this._memberCount;
    }

    set memberCount(value){
        this._memberCount = value;
    }

    get music(){
        return this._music;
    }

    set music(value){
        this._music = value;
    }

    addUser(user) {
        this.users[user.socket.id] = user;
        user.createCharacter(this.map);
        this.memberCount += 1;
    }

    removeUser(socket){
        if (socket.id in this.users){
            delete this.users[socket.id];
        }
        this.memberCount -= 1;
    }

    isEmpty(){
        return this.memberCount === 0;
    }

    getUserDatasForDraw(){
        const userDatas = {}
        // console.log(this.users);
        for(let socketId in this.users){
            let user = this.users[socketId];
            userDatas[socketId] = {userName: user.userName, characterNum: user.characterNum}
        }
        return userDatas;
    }

    /* 이동 관련 메소드 */

    start(io){
        const TILE_LENGTH = this.map.TILE_LENGTH;
        const WIDTH = this.map.WIDTH;
        const HEIGHT = this.map.HEIGHT;
        const BLOCKED_AREA = this.map.BLOCKED_AREA;
        const LEFT = 'ArrowLeft';
        const UP = 'ArrowUp';
        const RIGHT = 'ArrowRight'
        const DOWN = 'ArrowDown';
        setInterval(() => {
            let idArray = []; 
            let statuses = {};
            for (const user of Object.values(this.users)) {
                let col, row;
                const x = user.status.x;
                const y = user.status.y;

                if (user.keyPress[LEFT] === true) {
                    col = this.pixelToTile(x - TILE_LENGTH);
                    row = this.pixelToTile(y);
                    if (!this.checkBlockMap(BLOCKED_AREA, row, col)) {
                        user.status.x = x - TILE_LENGTH < 0 ? x : x - TILE_LENGTH;
                    }
                }
                if (user.keyPress[UP] === true) {
                    col = this.pixelToTile(x);
                    row = this.pixelToTile(y - TILE_LENGTH);
                    if (!this.checkBlockMap(BLOCKED_AREA, row, col)) {
                        user.status.y = y - TILE_LENGTH < 0 ? y : y - TILE_LENGTH;
                    }
                }
                if (user.keyPress[RIGHT] === true) {
                    col = this.pixelToTile(x + TILE_LENGTH);
                    row = this.pixelToTile(y);
                    if (!this.checkBlockMap(BLOCKED_AREA, row, col)) {
                        user.status.x = x + 2 * TILE_LENGTH > WIDTH ? x : x + TILE_LENGTH;
                    }
                }
                if (user.keyPress[DOWN] === true) {
                    col = this.pixelToTile(x);
                    row = this.pixelToTile(y + TILE_LENGTH);
                    if (!this.checkBlockMap(BLOCKED_AREA, row, col)) {
                        user.status.y = y + 2 * TILE_LENGTH > HEIGHT ? y : y + TILE_LENGTH;
                    }
                }
                let status_pair = {
                    status: user.status,
                    id: user.socket.id,
                    userName: user.userName,
                    characterNum: user.characterNum,
                };
                idArray.push(user.socket.id);
                statuses[user.socket.id] = status_pair;
            }
            io.to(this.name).emit('update', statuses, idArray);
            }, 100);    // 원래 50
    }

    pixelToTile(pixel){
        let tile = pixel/this.map.TILE_LENGTH + 1;
        return tile;
    }

    tileToPixel(tile){
        let pixel = (tile-1)*this.map.TILE_LENGTH;
        return pixel;
    }

    convertLocToNum(row, col){
        let target = ((row - 1) * (this.map.TILE_WIDTH) + (col))
        return target;
    }

    convertNumToTileRowCol(num) {
        let arr = []
        let TILE_WIDTH = this.map.TILE_WIDTH;
        let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
        let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
        arr[0] = row
        arr[1] = col
        return arr;
    }
    
    convertNumToPixelXY(num) {
        let arr = this.convertNumToTileRowCol(num);
        let x = this.tileToPixel(arr[1]); // x = col
        let y = this.tileToPixel(arr[0]); // y = row
        return [x, y];
    }

    checkBlockMap(block, row, col) {
        let target = this.convertLocToNum(row, col)
        if (block.includes(target)) {
            return true;
        } else {
            return false;
        }
    }
}
module.exports = Room;