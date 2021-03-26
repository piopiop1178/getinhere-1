import React, { Component } from 'react';
import axios from 'axios';

import PresetPage from './presetPage';
import RoomPage from './roomPage';

// 배경이미지, block 생성하기

const canvasHide = document.createElement("canvas");
const contextHide = canvasHide.getContext("2d");
canvasHide.id = "hide-layer";

const canvasBackground = document.createElement("canvas");
const contextBackground = canvasBackground.getContext("2d");
canvasBackground.id = "background-layer";

const canvasObject = document.createElement("canvas");
const contextObject = canvasObject.getContext("2d");
canvasObject.id = "object-layer";

const canvasCharacter = document.createElement("canvas");
canvasCharacter.id = "character-layer";

class Mainpage extends Component {
    state = {
        page: PresetPage,
        roomName: "",
        userName: "",
        characterNum: -1,
        map: {},
        characterList: [],
    }

    componentDidMount = async () => {
        await this.setState({roomName: this.props.match.params.roomName});
        let map;
        axios.get('/api/map', {
            params: { 
                roomName : this.state.roomName
            }})
        .then(response => {
            this.setState({map : response.data.map})
            map = response.data.map;
            const width = map._WIDTH;
            const height = map._HEIGHT;

            const backgroundImage = new Image();
            backgroundImage.onload = () => {
                contextBackground.drawImage(backgroundImage, 0, 0, width, height);
            };
            backgroundImage.src = map._BACKGROUND_IMG_PATH;

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

            canvasHide.setAttribute("width", width);
            canvasHide.setAttribute("height", height);
            document.getElementById("main").appendChild(canvasHide);

            const objects = map._BLOCKED_AREA;
            const tile_length = map._TILE_LENGTH;

            for(let i = 0; i < objects.length; i++) {
                let tile_row_col = this.convertNumToTileRowCol(objects[i], tile_length) ;
                let pixel_x = (tile_row_col[1] - 1) * tile_length;
                let pixel_y = (tile_row_col[0] - 1) * tile_length;
                contextObject.fillStyle = "black";
                contextObject.fillRect(pixel_x, pixel_y, tile_length, tile_length);
            }
        });


        axios.get('/api/characterList')
        .then(response => {
            const characterList = response.data.characterList;
            for(let index in characterList){
                const characterImage = new Image();
                characterImage.onload = () => {
                    contextHide.drawImage(characterImage, map._CHAR_SIZE*index, 0, map._CHAR_SIZE, map._CHAR_SIZE);
                }
                characterImage.src = characterList[index];
                this.state.characterList[index] = characterImage;
            }
        });
    }

    joinRoom = (userName, characterNum) => {
        this.setState({userName, characterNum});
        this.setState({page: RoomPage});
    }

    convertNumToTileRowCol = (num, tile_width) => {
        let arr = []
        let row = num % tile_width ? parseInt(num / tile_width) + 1 : parseInt(num / tile_width);
        let col = num % tile_width ? num % tile_width : tile_width;
        // console.log(row, col);
        arr[0] = row
        arr[1] = col
        return arr;
    }

    render () {
        return (
            <div id="main">
            {/* <h1>여기는 메인 페이지</h1> */}
              <this.state.page
                joinRoom={this.joinRoom}
                roomName={this.state.roomName}
                userName={this.state.userName}
                characterNum={this.state.characterNum}
                map={this.state.map}
                characterList={this.state.characterList}
                />  
            </div>
        );
    }
}

export default Mainpage
