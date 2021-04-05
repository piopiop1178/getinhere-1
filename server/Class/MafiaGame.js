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

const dayTime = 10000;          // 120000
const nightTime = 5000;        // 20000

class MafiaGame{
    constructor(){
        this.isDay = false;
        this.players = {};   // players {socketId: {socket: socketObject, role:police}}
        this.citizens = [];
        this.mafias = [];
        this.police = undefined;
        this.doctor = undefined;
        this.playerCount = 0;
        this.deadPlayers = [];
        this.candidate = {}; // {socketId: socketId}
        this.selectedCount = {};
        this.turn = 0;
        this.confirmCount = 0;
        this.liveOrDie = [undefined, undefined];
        this.checkCount = undefined;
    }

    async init(){
        this.isDay = false;
        this.citizens = [];
        this.mafias = [];
        this.police = undefined;
        this.doctor = undefined;
        this.playerCount = this.players.length;
        this.turn = 0;
    }

    addPlayer(socket){
        this.players[socket.id] = {socket: socket, role: undefined};
        this.playerCount += 1;
    }

    async raffleRole(){
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
            if(role === "mafia"){
                this.mafias.push(socket);
            }
            else{
                if(role === "police"){
                    this.police = socket;
                }
                else if(role === "doctor"){
                    this.doctor = socket;
                }
                this.citizens.push(socket);
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

    async turnStart() {
        turnInit();
        setTimeout(() => {
            this.turnEnd(this.turn);
        }, this.isDay ? dayTime : nightTime);
    }

    turnInit(){
        this.isDay = !this.isDay;
        this.candidate = {};
        this.selectedCount = {};
        for(let id in Object.keys(this.players)){
            this.selectedCount[id] = 0;
        }
        this.confirmCount = 0;
        this.checkCount = this.mafias.length;
        if(this.isDay === true){
            this.liveOrDie = [undefined, undefined];
            this.checkCount += this.citizens.length;
        }
        else{
            if(this.police !== undefined){
                this.checkCount++;
            }
            if(this.doctor !== undefined){
                this.checkCount++;
            }
        }
    }

    turnEnd(turn) {
        if(this.turn !== turn){
            return;
        }
        this.turn++;
        for(let socketId in Object.keys(this.players)){
            this.players[socketId].socket.emit("turnEnd"); 
        }
    }

    selectCandidate(socketId, candidateSocketId){
        this.candidate[socketId] = candidateSocketId;
        if(this.selectedCount[candidateSocketId] !== undefined){
            this.selectedCount[candidateSocketId]++;

            const array1 = [1, 4, 9, 16];
            // pass a function to map
            const map1 = array1.map(x => x * 2);
            console.log(map1);
            // expected output: Array [2, 8, 18, 32]

            let sameRolePlayers = [];
            if(this.isDay === true){
                sameRolePlayers = this.players.map(player => player.socket);
            }
            else{
                const role = this.players[socketId].role;
                if(role === "mafia"){
                    sameRolePlayers = Object.keys(this.mafias);
                }
                else if(role === "police"){
                    sameRolePlayers = [socketId];
                }
                else if(role === "doctor"){
                    sameRolePlayers = [socketId];
                }
            }
            for(let id in sameRolePlayers){
                this.players[id].socket.emit("sendCandidateResult", socketId, candidateSocketId);
            }
        }
    }    

    confirmCandidate(socketId){
        this.confirmCount++;
        if(this.confirmCount === this.checkCount){
            if(isDay){
                let candidate = undefined;
                if(this.selectedCount.length === 0){
                    candidate = undefined;
                }
                if(this.selectedCount.length === 1){
                    candidate = Object.keys(this.selectedCount)[0];
                    this.liveOrDie = [candidate, 0, {live: [], die: []}];
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
                        candidate = undefined;
                    }
                    else{
                        candidate = sortedArray[0][0];
                        this.liveOrDie = [candidate, 0, {live: [], die: []}];
                    }
                }
                for(let id in Object.keys(this.players)){
                    this.players[socketId].socket.emit("sendVoteResult", candidate)
                }
                if(candidate === undefined){
                    this.turnEnd();
                }
            }
            else{
                /* 경찰 */
                this.police.socket.emit("checkMafia", this.candidate[this.police.id].role === 'mafia');
                /* 의사 */
                const doctorPick = this.candidate[this.doctor.id];

                this.selectedCount[this.police.id]--;
                this.selectedCount[this.doctor.id]--;

                /* 마피아 선택 */
                let mafiaPicks = [];
                let mafiaPick = undefined;
                for (let id in Object.keys(this.selectedCount)){
                    mafiaPicks.push = [id, selectCount[id]];
                    mafiaPicks.sort((a, b) => {
                        return b[1] - a[1];
                    });
                    if(mafiaPicks.length === 1 || mafiaPicks[0][1] > mafiaPicks[1][1]){
                        mafiaPick = mafiaPicks[0][0];
                    }
                }
                if(mafiaPick === doctorPick){
                    mafiaPick = undefined;
                }
                for (let socketId in Object.keys(this.players)){
                    this.players.socket.emit("nightOver", mafiaPick, this.checkGameOver())
                }
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
            this.liveOrDie[2][die].push(socketId);
        }
        let result = undefined;
        if(this.liveOrDie[1] === this.checkCount){
            if(this.liveOrDie[2][live] < this.liveOrDie[2][die]){
                result = 'die';
            }
            else{
                result = 'live';
            }
            for(let id in Object.keys(this.players)){
                this.players[id].socket.emit("confirmLiveOrDie", result);
            }
        }
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
