'use strict';

class User{
    constructor(socket, userName, characterNum){
        this.socket = socket;
        this.keyPress = {};
        this.status = {};
        this.userName = userName;
        this.characterNum = characterNum;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get characterNum() {
        return this._characterNum;
    }

    set characterNum(value) {
        this._characterNum = value;
    }

    get socket() {
        return this._socket;
    }

    set socket(value) {
        this._socket = value;
    }

    get keyPress() {
        return this._keyPress;
    }

    set keyPress(value) {
        this._keyPress = value;
    }

    get status () {
        return this._status;
    }

    set status (value) {
        this._status = value;
    }

    createCharacter(map){
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += (Math.floor(Math.random()*16)).toString(16);
        }
        this.status.x = Math.floor(Math.random()*map.TILE_WIDTH)*map.TILE_LENGTH;
        this.status.y = Math.floor(Math.random()*map.TILE_HEIGHT)*map.TILE_LENGTH;
        this.status.space = 0;
        this.status.height = map.CHAR_SIZE;
        this.status.width = map.CHAR_SIZE;
        this.status.color = color;
    }

    joinRoom(room){
        this.socket.join(room.name);
    }
}
module.exports = User;