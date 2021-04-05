'use strict';

const gameRoles = {
    3: {citizen : 2, mafia : 1, police : 0, doctor: 0},
    4: {citizen : 2, mafia : 1, police : 1, doctor: 0},
    5: {citizen : 2, mafia : 1, police : 1, doctor: 1},
    6: {citizen : 2, mafia : 2, police : 1, doctor: 1},
    7: {citizen : 3, mafia : 2, police : 1, doctor: 1},
    8: {citizen : 4, mafia : 2, police : 1, doctor: 1},
    9: {citizen : 5, mafia : 3, police : 1, doctor: 1},
};

class MafiaGame{
    constructor(){
        this.isDay = true;
        this.players = {};   // 객체로 추가 players {socketId: {role:police, selectedCount: 0}}
        this.citizens = [];
        this.polices = [];
        this.mafias = [];
        this.doctors = [];
        this.playerCount = 0;
        this.deadPlayers = [];
        this.candidate = {}; // {socketId: socketId}
        this.selectedCount = {};
        this.inTurn = false;
        this.confirmCount = 0;
        this.liveOrDie = [undefined, undefined];
    }

    init(){
        // constructor 참고 초기화
    }

    addPlayer(socket){
        this.players[socket.id] = {socket: socket, role: undefined};
        this.selectCount[socket.id] = 0;
        this.playerCount += 1;
    }

    raffleRole(){
        let roles = [];
        for(let role in Object.keys(gameRoles[this.playerCount])){
            for(let i; i < gameRoles[this.playerCount].role; i++){
                roles.push(role);
            }
        }
        this.shuffle(roles);
        let i = 0;
        let role, socket;
        for(let socketId in Object.keys(this.players)){
            role = roles[i++]
            socket = this.players[socketId].socket;
            this.players[socketId].role = role;
            socket.emit("sendRole", role);
            if(role === "citizen"){
                this.citizens.push(socket);
            }
            else if(role === "mafia"){
                this.mafias.push(socket);
            }
            else if(role === "police"){
                this.polices.push(socket);
            }
            else if(role === "doctor"){
                this.doctors.push(socket);
            }
        }
    }

    shuffle(array) {
        let size = array.length;
        let temp, i;
        while(size) {
            i = Math.floor(Math.random() * size--);
            temp = array[size];
            array[size] = array[i];
            array[i] = temp;
        }
    }

    turnStart(timeCount) {
        this.inTurn = true;
        setTimeout(this.turnEnd, timeCount);
    }

    turnEnd() {
        if(this.inTurn === false){
            return;
        }
        this.inTurn = false;
        for(let socketId in Object.keys(this.players)){
            this.players[socketId].socket.emit("turnEnd"); 
        }
    }

    selectCandidate(socketId, candidateSocketId){
        this.candidate[socketId] = candidateSocketId;
        this.selectedCount[candidateSocketId]++;
        /* 선택 정보를 역할이 같은 플레이어에게도 공유 */
        let sameRolePlayers;

        if(this.isDay === true){
            sameRolePlayers = Object.keys(this.players);
        }
        else{
            const role = this.players[socketId].role;
            if(role === "mafia"){
                sameRolePlayers = Object.keys(this.mafias);
            }
            else if(role === "police"){
                sameRolePlayers = Object.keys(this.polices);
            }
            else if(role === "doctor"){
                sameRolePlayers = Object.keys(this.docters);
            }
        }
        for(let socketId in sameRolePlayers){
            this.players[socketId].socket.emit("sendCandidateResult", socket.id, candidateSocketId);
        }
    }    

    confirmCandidate(){
        this.confirmCount++;
        socket.emit("sendCandidateResult"); 
        if(this.confirmCount === this.playerCount){
            if(isDay){
                let deadPlayer;
                /* 생사 투표 진행 여부 확인 및 진행*/
                if(this.selectedCount.length === 0){
                    /* 투표 진행 안함 */
                    return undefined;
                }
                if(this.selectedCount.length === 1){
                    /* 생사 투표 진행 */
                    deadPlayer = Object.keys(this.selectedCount)[0];
                }
                else{
                    let sortedArray = [];
                    for(let socketId in this.selectedCount){
                        sortedArray.push([socketId, this.selectedCount[socketId]]);
                    }
                    sortedArray.sort((a, b) => {
                        return b[1] - a[1];
                    });
                    if(sortedArray[0][1] == sortedArray[1][1]){
                        /* 투표 진행 안함 */
                        return undefined;
                    }
                    else{
                        deadPlayer = sortedArray[0][0];
                    }
                }
                this.liveOrDie = [deadPlayer, 0, {live: [], die: []}];
                return deadPlayer;   
            }
            else{
                /* 직업 별 결과 전송*/
            }
        }
    };

    checkLiveOrDie(socketId, liveOrDie){
        if(liveOrDie === 'live'){
            this.liveOrDie[1]++;
            this.liveOrDie[2][live].push(socketId);
        }
        else{
            this.liveOrDie[1]++;
            this.liveOrDie[2][live].push(socketId);
        }
        if(this.liveOrDie[1] == this.playerCount){
            if(this.liveOrDie[2][live] < this.liveOrDie[2][die]){
                return 'die';
            }
            else{
                return 'live';
            }
        }
        return undefined;
    }

    checkGameOver(){
        return this.mafias.length >= this.citizens.length;
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
