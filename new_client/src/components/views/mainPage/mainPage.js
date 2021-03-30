import React, { Component } from 'react';
import {PresetPage, LoadingPage} from './presetPage';
import RoomPage from './roomPage';
import axios from 'axios';
import './mainPage.css'

import {io} from 'socket.io-client';
import socketPromise from './socket.io-promise';

import dotenv from 'dotenv';
dotenv.config();

// require('dotenv').config();
const backUrl = process.env.REACT_APP_PROXY_TARGET;

console.log(process.env.HTTPS);
console.log(backUrl);
// const backUrl = 'https://localhost:5000';
const socket = io(`${backUrl}`, {transport: ['websocket']}) //! 얘는 뭔가요
socket.request = socketPromise.promise(socket);

class Mainpage extends Component {
    state = {
        roomName: "",
        userName: "",
        characterNum: -1,
        map: {},
        characterList: [],
        musicList: {},
        isLoadingMain: true,
        isFinishedPreset: false,
    }

    componentDidMount = async () => {
        this.setState({roomName: this.props.match.params.roomName});
        socket.emit("initSocket", this.props.match.params.roomName);
        axios.get('/api/map', {
            params: { 
                roomName : this.props.match.params.roomName,
            }})
        .then(response => {
            this.setState({map : response.data.map})

            const map = response.data.map;
            const width = map._WIDTH;
            const height = map._HEIGHT;

            /* canvas 생성 */
            const canvasBackground = document.createElement("canvas");
            const contextBackground = canvasBackground.getContext("2d");
            canvasBackground.id = "background-layer";

            const canvasObject = document.createElement("canvas");
            const contextObject = canvasObject.getContext("2d");
            canvasObject.id = "object-layer";

            const canvasCharacter = document.createElement("canvas");
            canvasCharacter.id = "character-layer";

            /* canvas 속성 설정 및 main에 추가 */
            const main = document.getElementById("main");
            
            canvasBackground.setAttribute("width", width);
            canvasBackground.setAttribute("height", height);
            main.appendChild(canvasBackground);
            
            canvasObject.setAttribute("width", width);
            canvasObject.setAttribute("height", height);
            main.appendChild(canvasObject);
            
            canvasCharacter.setAttribute("width", width);
            canvasCharacter.setAttribute("height", height);
            document.getElementById("main").appendChild(canvasCharacter);
            
            this.drawBackground(contextBackground, map, width, height);
            this.drawBlockZone(contextObject, map._BLOCKED_AREA, map._TILE_LENGTH, map._TILE_WIDTH);
            // console.log(map._MUSIC_LIST);
            this.drawMusicObject(contextObject, map._MUSIC_LIST, map._TILE_LENGTH, map._TILE_WIDTH);
        })
        .then(() => {
            axios.get('/api/characterList')
            .then(response => {
                const characterList = response.data.characterList;
                const map = this.state.map;
                const width = map._WIDTH;
                const height = map._HEIGHT;

                const canvasHide = document.createElement("canvas");
                const contextHide = canvasHide.getContext("2d");
                canvasHide.id = "hide-layer";

                for(let index in characterList){
                    const characterImage = new Image();
                    characterImage.onload = () => {
                        // contextHide.drawImage(characterImage, map._CHAR_SIZE*index, 0, map._CHAR_SIZE, map._CHAR_SIZE);
                    }
                    characterImage.src = characterList[index];
                    this.state.characterList[index] = characterImage;
                }

                canvasHide.setAttribute("width", width);
                canvasHide.setAttribute("height", height);
                document.getElementById("main").appendChild(canvasHide);
            });
        })
        setTimeout(() => {
            this.setState({
                isLoadingMain: false,
            })
        }, 2000);
    }


    drawMusicObject(contextObject, musics, TILE_LENGTH, TILE_WIDTH){
        for(let i = 0; i < musics.POSITION_LIST.length; i++) {
            let tile_row_col = this.convertNumToTileRowCol(musics.POSITION_LIST[i], TILE_WIDTH);
            let pixel_x = (tile_row_col[1] - 1) * TILE_LENGTH;
            let pixel_y = (tile_row_col[0] - 1) * TILE_LENGTH;
            const musicImage = new Image();
            musicImage.onload = () => {
                contextObject.drawImage(musicImage, pixel_x, pixel_y, TILE_LENGTH, TILE_LENGTH);
            }
            musicImage.src = musics.IMAGE_LIST[i];
            this.state.musicList[musics.POSITION_LIST[i]] = musics.SOURCE_LIST[i];
        }
    }

    drawBlockZone(contextObject, blocks, TILE_LENGTH, TILE_WIDTH){
        for(let i = 0; i < blocks.length; i++) {
            let tile_row_col = this.convertNumToTileRowCol(blocks[i], TILE_WIDTH) ;
            let pixel_x = (tile_row_col[1] - 1) * TILE_LENGTH;
            let pixel_y = (tile_row_col[0] - 1) * TILE_LENGTH;
            contextObject.fillStyle = "black";
            contextObject.fillRect(pixel_x, pixel_y, TILE_LENGTH, TILE_LENGTH);
        }
    }

    drawBackground(contextBackground, map, width, height) {
        const backgroundImage = new Image();
        backgroundImage.onload = () => {
            contextBackground.drawImage(backgroundImage, 0, 0, width, height);
        };
        backgroundImage.src = map._BACKGROUND_IMG_PATH;
    }
    
    convertNumToTileRowCol = (num, TILE_WIDTH) => {
        let arr = []
        let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
        let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
        // console.log(row, col);
        arr[0] = row
        arr[1] = col
        return arr;
    }

    finishPreset = (userName, characterNum) => {
        if(this.state.isInitMain===false){
            return ;
        }
        this.setState({userName, characterNum});
        this.setState({isFinishedPreset: true});
    }

    render () {
        let contentPage;
        if (this.state.isLoadingMain){
            contentPage = <LoadingPage/>
        }
        else{
            if (this.state.isFinishedPreset === false) {
                contentPage = <PresetPage finishPreset={this.finishPreset}/>
            } else {
                contentPage = <RoomPage
                                roomName={this.state.roomName}
                                userName={this.state.userName}
                                characterNum={this.state.characterNum}
                                map={this.state.map}
                                characterList={this.state.characterList}
                                musicList={this.state.musicList}
                                socket={socket}
                                />
            }
        }
        return (
            <div id="main">
                {contentPage}
            </div>
        );
    }
}

export default Mainpage
