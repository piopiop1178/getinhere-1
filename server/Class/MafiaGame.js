'use strict';

const gameRoles = {
    2: {"citizen" : 1, "mafia" : 1, "police" : 0, "doctor" : 0},
    3: {"citizen" : 2, "mafia" : 1, "police" : 0, "doctor" : 0},
    // 4: {"citizen" : 2, "mafia" : 1, "police" : 1, "doctor" : 0},
    4: {"citizen" : 1, "mafia" : 1, "police" : 1, "doctor" : 1},
    5: {"citizen" : 2, "mafia" : 1, "police" : 1, "doctor" : 1},
    6: {"citizen" : 2, "mafia" : 2, "police" : 1, "doctor" : 1},
    7: {"citizen" : 3, "mafia" : 2, "police" : 1, "doctor" : 1},
    8: {"citizen" : 4, "mafia" : 2, "police" : 1, "doctor" : 1},
    9: {"citizen" : 5, "mafia" : 3, "police" : 1, "doctor" : 1},
};

const dayTime = 120000;          // 120000
const nightTime = 30000;        // 20000

class MafiaGame{
    constructor(){
        this.isPlaying = false;
        this.isDay = false;
        this.players = {};   // players {socketId: {socket: socketObject, role:police}}
        this.citizens = {};
        this.mafias = {};
        this.police = undefined;
        this.doctor = undefined;
        this.playerCount = 0;
        this.deadPlayers = {};
        this.turn = 0;

        this.candidate = {}; // {socketId: socketId}
        this.selectedCount = {};
        this.confirmCount = 0;
        this.liveOrDie = [undefined, undefined, undefined];
        this.checkCount = undefined;
    }

    endGame = () => {
        console.log('-----------엔드게임----------');
        this.isPlaying = false;
        this.isDay = false;
        this.players = {};   // players {socketId: {socket: socketObject, role:police}}
        this.citizens = {};
        this.mafias = {};
        this.police = undefined;
        this.doctor = undefined;
        this.playerCount = 0;
        this.deadPlayers = {};
        this.turn = 0;

        this.candidate = {}; // {socketId: socketId}
        this.selectedCount = {};
        this.confirmCount = 0;
        this.liveOrDie = [undefined, undefined, undefined];
        this.checkCount = undefined;
    }

    async init(){
        this.isPlaying = false;
        this.isDay = false;
        this.citizens = {};
        this.mafias = {};
        this.police = undefined;
        this.doctor = undefined;
        this.playerCount = Object.keys(this.players).length;
        this.deadPlayers = {};
        this.turn = 0;
    }

    addPlayer(socket){
        console.log("addPlayer");
        if (this.players[socket.id] !== undefined){
            console.log(`player(${socket.id}) is already exist`);
            return;
        }
        this.players[socket.id] = {"socket": socket, "role": undefined};
        this.playerCount += 1;
        console.log(socket.id, Object.keys(this.players));
    }

    raffleRoles = async () =>{
        console.log("raffleRoles");
        let roles = [];
        for(let role in gameRoles[this.playerCount]){
            for(let i = 0; i < gameRoles[this.playerCount][role]; i++){
                roles.push(role);
            }
        }
        this.shuffle(roles);
        let i = 0;
        let role, socket;
        for(let socketId in this.players){
            role = roles[i++]
            this.players[socketId].role = role;
            console.log(role);
            socket = this.players[socketId].socket;
            socket.emit("sendRole", role);
            if(role === "mafia"){
                this.mafias[socketId] = socket;
            }
            else{
                if(role === "police"){
                    this.police = socket;
                }
                else if(role === "doctor"){
                    this.doctor = socket;
                }
                this.citizens[socketId] = socket;
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
        this.turnInit();
        const turn = this.turn;
        console.log(`${turn} 번째 턴 시작`);
        //! 타이머
        // setTimeout(() => {
        //     this.turnEnd(turn);
        // }, this.isDay ? dayTime : nightTime);
    }

    turnInit(){
        console.log("turnInit");
        this.isDay = !this.isDay;
        this.candidate = {};
        this.selectedCount = {};
        for(let id in this.players){
            this.selectedCount[id] = 0;
        }
        this.confirmCount = 0;
        if(this.isDay === true){
            this.liveOrDie = [undefined, undefined, undefined];
            this.checkCount = this.playerCount;
        }
        else{
            this.checkCount = Object.keys(this.mafias).length;
            if(this.police !== undefined){
                this.checkCount++;
            }
            if(this.doctor !== undefined){
                this.checkCount++;
            }
        }
    }

    turnEnd(turn) {
        console.log("turnEnd");
        if(this.turn !== turn){
            console.log("this.turn !== turn", this.turn, turn);
            return;
        }
        this.turn++;
        console.log(this.turn, turn);
        if(this.checkGameOver() !== null){
            // 게임 종료 관련 구현 필요?
            console.log("------------------게임 종료------------------", this.checkGameOver(), '승리');
            // this.turnInit();
            // this.init();
            this.endGame();
        }
        else{
            if(this.isDay){
                console.log("밤이 되었습니다");
                for(let socketId in this.players){
                    this.players[socketId].socket.emit("doNightAction"); 
                }
            }
            else{
                console.log("낮이 되었습니다");
                for(let socketId in this.players){
                    this.players[socketId].socket.emit("turnEnd"); 
                }
            }
            this.turnStart();
        }
    }

    selectCandidate(socketId, candidateSocketId){
        if(!(socketId in this.players) && !(candidateSocketId in this.players)){
            console.log(!(socketId in this.players) && !(candidateSocketId in this.players));
            return;
        }
        if(this.selectedCount[candidateSocketId] !== undefined){
            this.candidate[socketId] = candidateSocketId;
            console.log("selectCandidate", this.candidate);
            let sameRolePlayers = [];
            if(this.isDay === true){
                sameRolePlayers = Object.keys(this.players);
            }
            else{
                const role = this.players[socketId].role;
                if(role === "mafia"){
                    sameRolePlayers = Object.keys(this.mafias).concat(Object.keys(this.deadPlayers));
                }
                else if(role === "police"){
                    sameRolePlayers = [socketId];
                }
                else if(role === "doctor"){
                    sameRolePlayers = [socketId];
                }
            }
            for(let id of sameRolePlayers){
                this.players[id].socket.emit("sendCandidateResult", socketId, candidateSocketId);
            }
        }
    }    

    confirmCandidate(){
        this.confirmCount++;
        console.log("confirmCandidate", this.confirmCount, this.checkCount);
        if(this.confirmCount === this.checkCount){
            for(let id in this.candidate){
                this.selectedCount[this.candidate[id]]++;
            }
            console.log(this.selectedCount);
            if(this.isDay){
                let sortedArray = [];
                for(let socketId in this.selectedCount){
                    sortedArray.push([socketId, this.selectedCount[socketId]]);
                }
                sortedArray.sort((a, b) => {
                    return b[1] - a[1];
                });
                if(sortedArray[0][1] > sortedArray[1][1]){
                    const candidate = sortedArray[0][0];
                    this.liveOrDie = [candidate, 0, {'live': [], 'die': []}];
                    for(let id in this.players){
                        this.players[id].socket.emit("sendVoteResult", candidate);
                    }
                    console.log("candidate", candidate);
                }
                else{
                    console.log("candidate", undefined);
                    this.turnEnd(this.turn);
                    // this.turnStart();
                }
            }
            else{
                /* 경찰 */
                if(this.police !== undefined){
                    this.police.emit("checkMafia", this.players[this.candidate[this.police.id]].role === 'mafia');
                    for(let id in this.deadPlayers){
                        this.deadPlayers[id].socket.emit("checkMafia", this.players[this.candidate[this.police.id]].role === 'mafia');
                    }
                    this.selectedCount[this.candidate[this.police.id]]--;
                }
                
                /* 의사 */
                let doctorPick = undefined;
                if(this.doctor !== undefined){
                    doctorPick = this.candidate[this.doctor.id];
                    for(let id in this.deadPlayers){
                        this.deadPlayers[id].socket.emit("doctorPick", this.candidate[this.doctor.id]);
                    }
                    this.selectedCount[this.candidate[this.doctor.id]]--;
                }

                /* 마피아 선택 */
                let mafiaPicks = [];
                let mafiaPick = undefined;
                for (let id in this.selectedCount){
                    mafiaPicks.push([id, this.selectedCount[id]]);
                }

                mafiaPicks.sort((a, b) => {
                    return b[1] - a[1];
                });

                console.log('mafiaPicks', mafiaPicks);

                if(mafiaPicks.length === 1 || mafiaPicks[0][1] > mafiaPicks[1][1]){
                    mafiaPick = mafiaPicks[0][0];
                }
                
                if(mafiaPick !== undefined){
                    if(mafiaPick === doctorPick){
                        mafiaPick = undefined;
                    }
                    else{
                        this.die(mafiaPick);
                    }
                }
                console.log("mafiaPick", mafiaPick);
                for (let id in this.players){
                    this.players[id].socket.emit("nightOver", mafiaPick, this.checkGameOver())
                }
                this.turnEnd(this.turn);
                // this.turnStart();
            }
        }
    };

    checkLiveOrDie(socketId, liveOrDie){
        console.log("checkLiveOrDie", socketId, liveOrDie);
        if(liveOrDie === 'live'){
            console.log("liveOrDie === 'live'")
            this.liveOrDie[1]++;
            this.liveOrDie[2]['live'].push(socketId);
        }
        else{
            console.log("liveOrDie === 'die'")
            this.liveOrDie[1]++;
            this.liveOrDie[2]['die'].push(socketId);
        }
        if(this.liveOrDie[1] === this.checkCount){
            let result = undefined;
            console.log('생사 투표 결과', this.liveOrDie)
            if(this.liveOrDie[2]['live'].length < this.liveOrDie[2]['die'].length){
                console.log("checkLiveOrDie: 누군가 죽음")
                result = 'die';
                this.die(this.liveOrDie[0]);
            }
            else{
                result = 'live';
            }
            for(let id of Object.keys(this.players)){
                this.players[id].socket.emit("confirmLiveOrDie", result, this.liveOrDie[0], this.liveOrDie[2]['live'], this.liveOrDie[2]['die'], this.checkGameOver());
            }
            this.turnEnd(this.turn);

            //! 이거 5초 후에 실행하면 안되나?
            // this.turnStart();
        }
    }

    checkGameOver(){
        console.log("checkGameOver", Object.keys(this.mafias), Object.keys(this.citizens));
        if(Object.keys(this.mafias).length === 0){
            return '시민'
        }
        if(Object.keys(this.mafias).length >= Object.keys(this.citizens).length){
            return '마피아'
        }
        return null;
    }

    removePlayer(socketId){
        if(this.players[socketId] !== undefined){
            const role = this.players[socketId].role;
            if(role === "mafia"){
                delete this.mafias[socketId];
            }
            else if(role === "police"){
                this.police = undefined;
            }
            else if(role === "doctor"){
                this.doctor = undefined;
            }
            delete this.players[socketId];
            this.playerCount--;
            if(this.selectedCount[socketId] !== undefined){
                delete this.selectedCount[socketId];
            }
            for(let id in this.players){
                this.players[id].socket.emit("removePlayer", socketId);
            }
        }
    }
    die(playerId){
        this.deadPlayers[playerId] = this.players[playerId];
        this.playerCount--;
        const role = this.deadPlayers[playerId].role;
        if(role === "mafia"){
            console.log("die 마피아")
            delete this.mafias[playerId];
        }
        else{
            console.log("die 시민")
            delete this.citizens[playerId];
        }
        if(role === "police"){
            this.police = undefined;
        }
        if(role === "doctor"){
            this.doctor = undefined;
        }
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
    get playerCount(){
        return this._playerCount;
    }
    set playerCount(value){
        this._playerCount = value;
    }
}
module.exports = MafiaGame;
