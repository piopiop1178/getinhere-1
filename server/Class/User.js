'use strict';

class User{
    constructor(socket, userName, characterNum, screenShare){
        this.socket = socket;
        this.keyPress = {};
        this.status = {};
        this.userName = userName;
        this.characterNum = characterNum;
        this.screenShare = screenShare;
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

    get screenShare () {
        return this._screenShare;
    }

    set screenShare (value) {
        this._screenShare = value;
    }
    // this.status.x = Math.floor(Math.random()*map.TILE_WIDTH)*map.TILE_LENGTH;
    // this.status.y = Math.floor(Math.random()*map.TILE_HEIGHT)*map.TILE_LENGTH;

    createCharacter(map){
        this.status.x = Math.floor(Math.random()*13)*map.TILE_LENGTH;
        this.status.y = Math.floor( 8 + Math.random()*12)*map.TILE_LENGTH;
        this.status.space = this.calcSpace(this.status.x, this.status.y);
        this.status.height = map.CHAR_SIZE;
        this.status.width = map.CHAR_SIZE;
    }

    joinRoom(room){
        this.socket.join(room.name);
    }

    calcSpace = (x, y) => {
        if (y > 360) {
            return 1;
        }
        else if (x <= 780) {
            return 2;
        }
        else if (x >= 1680) {
            return 4;
        }
        else {
            return 3;
        }
    }
}
module.exports = User;