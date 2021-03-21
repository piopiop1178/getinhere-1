'use strict';

/* 제일 처음 접속한 Users 가 있을 Lobby를 처리할 함수 */

class LobbyManager {
    static lobby = [];
    static updating = false;

    constructor(){
    }

    /* lobby에 socket 삽입 */
    static push(socket) {
        this.lobby.push(socket);
    }

    /* lobby에서 socket 제거 */
    static kick(socket) {
        let index = this.lobby.indexOf(socket);
        if (index >= 0) this.lobby.splice(index, 1);
    }
    
    /* lobby 비우기 */
    static clean(){
        this.lobby = [];
    }
}

module.exports = LobbyManager;