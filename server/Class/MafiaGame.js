'use strict';

const gameRoles = {
    3: {citizenCount : 2, mafiaCount : 1, policeCount : 0, doctorCount: 0},
    4: {citizenCount : 2, mafiaCount : 1, policeCount : 1, doctorCount: 0},
    5: {citizenCount : 2, mafiaCount : 1, policeCount : 1, doctorCount: 1},
    6: {citizenCount : 2, mafiaCount : 2, policeCount : 1, doctorCount: 1},
    7: {citizenCount : 3, mafiaCount : 2, policeCount : 1, doctorCount: 1},
    8: {citizenCount : 4, mafiaCount : 2, policeCount : 1, doctorCount: 1},
    9: {citizenCount : 5, mafiaCount : 3, policeCount : 1, doctorCount: 1},
};

class MafiaGame{
    constructor(){
        this.isDay = true;
        this.players = {};   // 객체로 추가 players {socketId: {role:police, selectedCount: 0}}
        this.citizen = [];
        this.police = [];
        this.mafia = [];
        this.doctor = [];
        this.playerCount = 0;
        this.deadMan = [];
        this.candidate = {}; // {socketId: socketId}
    }

    // 랜덤 생성 로직 -> player 별 난수 부여, 정렬 순서대로 role 결정

    addPlayer(socketId){
        this.players[socketId] = {role: undefined, selectedCount: 0};
    }

    get isDay(){
        return this._isDay;
    }
    set isDay(value){
        this._isDay = value;
    }
    get players(){
        return this._players;
    }
    set players(value){
        this._players = value;
    }
}
module.exports = MafiaGame;
