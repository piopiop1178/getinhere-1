import React, { Component, createElement } from 'react'
import './ladderPage.css'

let nodeRows = 12;
let nodeColumns = 0;

let ladder = null;
let ladder_canvas = null;
let ladder_context = null;

let LADDER = {};
let GLOBAL_FOOT_PRINT = {};
let GLOBAL_CHECK_FOOT_PRINT = {};

let working = false;
let userName = "";

class LadderPage extends Component {
    state = {
        nodeWidth: 100,
        nodeHeight: 25,
    }
    
    componentDidMount = () => {
        ladder = document.getElementById("ladder");
        ladder_canvas = document.createElement("canvas");
        ladder_canvas.setAttribute("class", "ladder-canvas");
        ladder_canvas.setAttribute("id", "ladder-canvas");
        // ladder_canvas = document.getElementById("ladder-canvas");
        ladder_context = ladder_canvas.getContext("2d");

        document.getElementById("membersCount").addEventListener("keyup", (e) => {
            if(e.code === "Enter"){
                this.start();
            }
        });
    }

    start = () => {
        const membersCount = document.getElementById("membersCount").value;
        const regex = /^[0-9]{1,2}$/;
        if(!regex.test(membersCount)){
            alert("두 자리 정수만 입력해 주세요.");
            return;
        }
        if(membersCount < 2){
            return alert('최소 2명 이상 선택하세요.');
        }
        if(membersCount > 20){
            return alert('최대 20개까지 가능합니다');
        }
        const landing = document.getElementById("landing");
        nodeColumns = membersCount;
        if(membersCount > nodeRows + 2){
            nodeRows = membersCount - 2;
        }
        landing.remove();
        this.canvasDraw(); 
    };

    canvasDraw = async () => {
        ladder.setAttribute('width', `${(nodeColumns - 1) * this.state.nodeWidth + 10}px`);
        ladder.setAttribute('height', `${(nodeRows - 1) * this.state.nodeHeight + 10}px`);
        ladder.setAttribute('style', `background-color: #fff;`);
    
        ladder_canvas.setAttribute('width', `${(nodeColumns - 1) * this.state.nodeWidth + 10}px`);
        ladder_canvas.setAttribute('height', `${(nodeRows - 1) * this.state.nodeHeight + 10}px`);

        await this.setDefaultFootPrint();
        await this.reSetCheckFootPrint();
        await this.setDefaultRowLine();
        await this.setRandomNodeData();
        await this.userSetting();
        await this.drawDefaultLine();
        await this.drawNodeLine();
        await this.resultSetting();
    }

    setDefaultFootPrint = async () => {
        console.log("1");
        for (let r = 0; r < nodeRows; r++) {
            for (let c = 0; c < nodeColumns; c++) {
                GLOBAL_FOOT_PRINT[c + "-" + r] = false;
            }
        }
        console.log("1");
    }

    reSetCheckFootPrint = async () => {
        console.log("2");
        for (let r = 0; r < nodeRows; r++) {
            for (let c = 0; c < nodeColumns; c++) {
                GLOBAL_CHECK_FOOT_PRINT[c + "-" + r] = false;
            }
        }
        console.log("2");
    }

    setDefaultRowLine = async () => {
        console.log("3");
        for (let r = 0; r < nodeRows; r++) {
            let rowArr = [];
            for (let c = 0; c < nodeColumns; c++) {
                let id = c + "-" + r;
                rowArr.push(id);
            }
            LADDER[r] = rowArr;
        }
        console.log("3");
    }

    setRandomNodeData = async () => {
        console.log("4");
        for (let x = 0; x < nodeColumns; x++) {
            let loopNode = x + "-" + 0;
            GLOBAL_FOOT_PRINT[loopNode] = { "change": false, "draw": false }
        }
        for (let y = 1; y < nodeRows-1; y++) {
            for (let x = 0; x < nodeColumns; x++) {
                let loopNode = x + "-" + y;
                let rand = Math.floor(Math.random() * 2);
                if (rand == 0) {
                    GLOBAL_FOOT_PRINT[loopNode] = { "change": false, "draw": false }
                } else {
                    if (x == (nodeColumns - 1)) {
                        GLOBAL_FOOT_PRINT[loopNode] = { "change": false, "draw": false };
                    } else {
                        GLOBAL_FOOT_PRINT[loopNode] = { "change": true, "draw": true };;
                        x = x + 1;
                        loopNode = x + "-" + y;
                        GLOBAL_FOOT_PRINT[loopNode] = { "change": true, "draw": false };;
                    }
                }
            }
        }
        for (let x = 0; x < nodeColumns; x++) {
            let loopNode = x + "-" + nodeRows-1;
            GLOBAL_FOOT_PRINT[loopNode] = { "change": false, "draw": false }
        }
        console.log("4");
    }

    drawDefaultLine = async () => {
        console.log("5");
        ladder.appendChild(ladder_canvas);
        for (let c = 0; c < nodeColumns; c++){
            console.log(c);
            ladder_context.beginPath();
            ladder_context.moveTo(c*this.state.nodeWidth, 0);
            ladder_context.lineTo(c*this.state.nodeWidth, nodeRows*this.state.nodeHeight);
            ladder_context.strokeStyle = '#ddd';
            ladder_context.lineWidth = '2px';
            ladder_context.stroke();
            ladder_context.closePath();
        }
        console.log("5");
    }

    drawNodeLine = async () => {
        console.log("6");
        for (let r = 0; r < nodeRows; r++) {
            for (let c = 0; c < nodeColumns; c++) {
                let node = c + '-' + r;
                let nodeInfo = GLOBAL_FOOT_PRINT[node];
                if (nodeInfo["change"] && nodeInfo["draw"]) {
                    this.strokeLine(c, r, 'w', 'r', '#ddd', '2px');
                }
            }
        }
        console.log("6");
    }

    strokeLine = async (c, r, flag, dir, color, lineWidth) => {
        // ladder_canvas = document.getElementById('ladder-canvas');
        // ladder_context = ladder_canvas.getContext('2d');
        let moveToX, moveToY, lineToX, lineToY;
        let width = this.state.nodeWidth;
        let height = this.state.nodeHeight;
        if (flag == "w") {
            if (dir == "r") {
                moveToX = c * width;
                moveToY = r * height;
                lineToX = (c + 1) * width;
                lineToY = r * height;

            } else {
                moveToX = c * width;
                moveToY = r * height;
                lineToX = (c - 1) * width;
                lineToY = r * height;
            }
        } else {
            moveToX = c * width;
            moveToY = r * height;
            lineToX = c * width;
            lineToY = (r + 1) * height;
        }
        ladder_context.beginPath();
        ladder_context.moveTo(moveToX, moveToY);
        ladder_context.lineTo(lineToX, lineToY);
        ladder_context.strokeStyle = color;
        ladder_context.lineWidth = lineWidth;
        ladder_context.stroke();
        ladder_context.closePath();
    }

    userSetting = async () => {
        let userList = LADDER[0];
        const usersDiv = document.createElement("div");
        usersDiv.setAttribute("id", "users");
        let div;
        for (let i = 0; i < userList.length; i++) {
            let color = '#' + (function lol(m, s, c) { return s[m.floor(m.random() * s.length)] + (c && lol(m, s, c - 1)); })(Math, '0123456789ABCDEF', 4);
            let x = userList[i].split('-')[0] * 1;
            let y = userList[i].split('-')[1] * 1;
            let left = x * 100 - 30

            div = document.createElement("div");
            div.setAttribute("class", "user-wrap");
            div.setAttribute("style", `left: ${left}px;`);

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("data-node", userList[i]);
            input.setAttribute("placeholder", "누구?");

            const button = document.createElement("button");
            button.setAttribute("class", "ladder-start");
            button.setAttribute("data-color", `${color}`);
            button.setAttribute("data-node", `${userList[i]}`);
            button.setAttribute("style", `background-color:${color};`);
            button.addEventListener("click", this.goDown);

            div.appendChild(input);
            div.appendChild(button);
            usersDiv.appendChild(div);
        }
        ladder.appendChild(usersDiv);
    }

    resultSetting = async () => {
        let resultList = LADDER[nodeRows - 1];
        const resultsDiv = document.createElement("div");
        resultsDiv.setAttribute("id", "results");
        let div, input, p;
        for (let i = 0; i < resultList.length; i++) {
            let x = resultList[i].split('-')[0] * 1;
            let y = resultList[i].split('-')[1] * 1 + 1;
            let nodeId = x + "-" + y;
            let left = x * 100  -30;

            div = document.createElement("div");
            div.setAttribute("class", "answer-wrap");
            div.setAttribute("style", `left: ${left}px`);

            input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("data-node", `${nodeId}`);
            input.setAttribute("placeholder", "결과?");

            p = document.createElement("p");
            p.setAttribute("id", `${nodeId}-user`);
            
            div.appendChild(input);
            div.appendChild(p);
            resultsDiv.appendChild(div);
        }
        ladder.appendChild(resultsDiv);
    }

    goDown = async (e) => {
        if (working) {
            return false;
        }
        // document.getElementsByClassName('dim').remove();
        working = true;
        this.reSetCheckFootPrint();
        let userNode = e.target;
        userNode.setAttribute('disabled', 'true');

        let dataNode = userNode.getAttribute('data-node');
        let dataColor = userNode.getAttribute('data-color');
        
        this.startLineDrawing(dataNode, dataColor);

        userName = document.querySelector('input[data-node="' + dataNode + '"]').value;
    }

    startLineDrawing(dataNode, dataColor) {

        let x = dataNode.split('-')[0] * 1;
        let y = dataNode.split('-')[1] * 1;
        let dataNodeInfo = GLOBAL_FOOT_PRINT[dataNode];

        GLOBAL_CHECK_FOOT_PRINT[dataNode] = true;

        let dir = 'r'
        if (y == nodeRows) {
            this.reSetCheckFootPrint();
            const target = document.querySelector('input[data-node="' + dataNode + '"]');
            target.setAttribute("style", `background-color=${dataColor}`);
            const nameInput = document.getElementById(`${dataNode}-user`);
            nameInput.textContent = userName;
            // $().text(userName);
            working = false;
            return false;
        }
        if (dataNodeInfo["change"]) {
            let leftNode = (x - 1) + "-" + y;
            let rightNode = (x + 1) + "-" + y;
            let downNode = x + "-" + (y + 1);
            let leftNodeInfo = GLOBAL_FOOT_PRINT[leftNode];
            let rightNodeInfo = GLOBAL_FOOT_PRINT[rightNode];

            if (GLOBAL_FOOT_PRINT.hasOwnProperty(leftNode) && GLOBAL_FOOT_PRINT.hasOwnProperty(rightNode)) {
                let leftNodeInfo = GLOBAL_FOOT_PRINT[leftNode];
                let rightNodeInfo = GLOBAL_FOOT_PRINT[rightNode];
                if ((leftNodeInfo["change"] && leftNodeInfo["draw"] && !!!GLOBAL_CHECK_FOOT_PRINT[leftNode]) && (rightNodeInfo["change"]) && leftNodeInfo["draw"] && !!!GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
                    this.strokeLine(x, y, 'w', 'l', dataColor, 3)
                    setTimeout(() => {
                        this.startLineDrawing(leftNode, dataColor);
                    }, 100);
                }
                else if ((leftNodeInfo["change"] && !!!leftNodeInfo["draw"] && !!!GLOBAL_CHECK_FOOT_PRINT[leftNode]) && (rightNodeInfo["change"]) && !!!GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
                    this.strokeLine(x, y, 'w', 'r', dataColor, 3)
                    setTimeout(() => {
                        this.startLineDrawing(rightNode, dataColor);
                    }, 100);
                }
                else if ((leftNodeInfo["change"] && leftNodeInfo["draw"] && !!!GLOBAL_CHECK_FOOT_PRINT[leftNode]) && (!!!rightNodeInfo["change"])) {
                    this.strokeLine(x, y, 'w', 'l', dataColor, 3)
                    setTimeout(() => {
                        this.startLineDrawing(leftNode, dataColor);
                    }, 100);
                }
                else if (!!!leftNodeInfo["change"] && (rightNodeInfo["change"]) && !!!GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
                    this.strokeLine(x, y, 'w', 'r', dataColor, 3)
                    setTimeout(() => {
                        this.startLineDrawing(rightNode, dataColor);
                    }, 100);
                }
                else {
                    this.strokeLine(x, y, 'h', 'd', dataColor, 3)
                    setTimeout(() => {
                        this.startLineDrawing(downNode, dataColor);
                    }, 100);
                }
            } else {
                if (!!!GLOBAL_FOOT_PRINT.hasOwnProperty(leftNode) && GLOBAL_FOOT_PRINT.hasOwnProperty(rightNode)) {
                    if ((rightNodeInfo["change"] && !!!rightNodeInfo["draw"]) && !!!GLOBAL_CHECK_FOOT_PRINT[rightNode]) {
                        this.strokeLine(x, y, 'w', 'r', dataColor, 3)
                        setTimeout(() => {
                            this.startLineDrawing(rightNode, dataColor);
                        }, 100);
                    } else {
                        this.strokeLine(x, y, 'h', 'd', dataColor, 3)
                        setTimeout(() => {
                            this.startLineDrawing(downNode, dataColor);
                        }, 100);
                    }

                } else if (GLOBAL_FOOT_PRINT.hasOwnProperty(leftNode) && !!!GLOBAL_FOOT_PRINT.hasOwnProperty(rightNode)) {
                    if ((leftNodeInfo["change"] && leftNodeInfo["draw"]) && !!!GLOBAL_CHECK_FOOT_PRINT[leftNode]) {
                        this.strokeLine(x, y, 'w', 'l', dataColor, 3)
                        setTimeout(() => {
                            this.startLineDrawing(leftNode, dataColor);
                        }, 100);
                    } else {
                        this.strokeLine(x, y, 'h', 'd', dataColor, 3)
                        setTimeout(() => {
                            this.startLineDrawing(downNode, dataColor);
                        }, 100);
                    }
                }
            }
        } else {
            let downNode = x + "-" + (y + 1);
            this.strokeLine(x, y, 'h', 'd', dataColor, 3)
            setTimeout(() => {
                this.startLineDrawing(downNode, dataColor);
            }, 100);
        }
    }


    render() {
        return (
            <div id="wrapper">
                <div className="landing" id="landing">
                    <div className="start-form">
                        <div className="landing-form">
                            <input id="membersCount" type="text" name="member" placeholder="인원을 입력하세요(2~20)" autoComplete="off" required />
                            <div id="button" className="button raised green" onClick={this.start}>START</div>
                        </div>
                    </div>
                </div>
                <div id="ladderGame">
                    <div id="ladder-title"> 빈칸을 채우고 원을 클릭!</div>
                    <div id="ladder" className="ladder">
                        {/* <div className="dim"></div> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default LadderPage