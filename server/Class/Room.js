'use strict';

const MafiaGame = require('./MafiaGame');

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
        this.video = false;
        this.mafiaGame = new MafiaGame();
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

    get video(){
        return this._video;
    }
    set video(value){
        this._video = value;
    }

    get mafiaGame(){
        return this._mafiaGame;
    }
    set mafiaGame(value){
        this._mafiaGame = value;
    }

    addUser(user) {
        this.users[user.socket.id] = user;
        user.createCharacter(this.map);
        this.memberCount += 1;
    }

    removeUser(socket){
        if (socket.id in this.users){
            delete this.users[socket.id];
            this.memberCount -= 1;
        }
    }

    isEmpty(){
        return this.memberCount === 0;
    }

    getUserDatasForDraw(){
        const userDatas = {}
        // console.log(this.users);
        for(let socketId in this.users){
            let user = this.users[socketId];
            userDatas[socketId] = {userName: user.userName, characterNum: user.characterNum, space: user.status.space, screenShare: user.screenShare}
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

                /* * 개선안: if문 5번 삼항연산자 4번 아울러 대각선 방지, but tmpX tmpY로 메모리 조금 더 씀 */
                let tmpX = x
                let tmpY = y;
                if (user.keyPress[UP]    === true) {tmpY = y -   TILE_LENGTH < 0      ? y : y - TILE_LENGTH;}
                if (user.keyPress[RIGHT] === true) {tmpX = x + 2*TILE_LENGTH > WIDTH  ? x : x + TILE_LENGTH;}
                if (user.keyPress[DOWN]  === true) {tmpY = y + 2*TILE_LENGTH > HEIGHT ? y : y + TILE_LENGTH;}
                if (user.keyPress[LEFT]  === true) {tmpX = x -   TILE_LENGTH < 0      ? x : x - TILE_LENGTH;}
                col = this.pixelToTile(tmpX);
                row = this.pixelToTile(tmpY);
                if (!this.checkBlockMap(BLOCKED_AREA, row, col)) {
                    user.status.x = tmpX;
                    user.status.y = tmpY;
                }
                
                let status_pair = {
                    status: user.status,
                    id: user.socket.id,
                    userName: user.userName,
                    characterNum: user.characterNum.length >=3 ? -1: user.characterNum,
                };
                idArray.push(user.socket.id);
                statuses[user.socket.id] = status_pair;
            }
            io.to(this.name).emit('update', statuses, idArray);
            }, 150);    // 원래 50
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