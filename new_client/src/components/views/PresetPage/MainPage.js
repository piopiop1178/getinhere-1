import React, { Component } from 'react';
import PresetPage from './PresetPage'
import RoomPage from '../RoomPage/RoomPage'
import axios from 'axios';

/* 경로로 이미지 가져오기 */
// import image1 from '../../../images/1.jpg'
// import image2 from '../../../images/2.png'
// import image3 from '../../../images/3.png'
// import image4 from '../../../images/4.png'
// import image5 from '../../../images/5.png'
// import image6 from '../../../images/6.png'
// import image7 from '../../../images/7.png'
import among from '../../../images/among.jpg'
import tile from '../../../images/tile2.jpg'



class Main extends Component {
    state = {
        // page: PresetPage,
        pagePreset: 0,
        roomName: "",
        map: {},
        characterList: {
            // image1,
            // image2,
            // image3,
            // image4,
            // image5,
            // image6,
            // image7,
            among,
            tile,
        },
        rendered: 0,
    }
    componentDidMount = async () => {
        await this.setState({roomName: this.props.match.params.roomName}); //? 과연 await은?!
        axios.get('/api/map', {
            params: { 
                roomName : this.state.roomName
            }})
        .then(response => {
            this.setState({map : response.data.map})
            
        }).then(() => {
            let map = this.state.map;
    
            let among = new Image();
            // among.src = "../image/among.jpg";
            among.src = this.state.characterList.among;
    
            let audio = new Audio('../music/all_falls_down.mp3'); //TODO 경로 재설정해주기
            
            /* 캔버스 만들기(BG와 OBJ만 있음) */
            /* 백그라운드 */
            const canvasBackground = document.createElement("canvas");
            const contextBackground = canvasBackground.getContext("2d");
            canvasBackground.id = "background-layer";
            canvasBackground.style.position = "absolute";
            canvasBackground.style.zIndex = "-10";
            // canvasBackground.style.top = "0px";
    
            /* 오브젝트 */
            const canvasObject = document.createElement("canvas");
            const contextObject = canvasObject.getContext("2d");
            canvasObject.id = "object-layer";
            canvasObject.style.position = "absolute";
            canvasObject.style.zIndex = "-5";
            // canvasObject.style.top = "0px";
    
    
            /* Canvas 관련 전역변수 설정 */
            let MAP_SETTINGS = this.state.map;
            let TILE_LENGTH = MAP_SETTINGS._TILE_LENGTH
            let TILE_WIDTH = MAP_SETTINGS._TILE_WIDTH
            let TILE_HEIGHT = MAP_SETTINGS._TILE_HEIGHT
            let CHAR_SIZE = MAP_SETTINGS._TILE_LENGTH
            let WIDTH = MAP_SETTINGS._WIDTH
            let HEIGHT = MAP_SETTINGS._HEIGHT
            
            /* Canvas 그림 관련 함수 */
            function drawBackground(contextBackground, MAP_SETTINGS, tile) {
                console.log('drawBackground');
                // 배경 이미지
                // let backgroundImage = new Image();
                // backgroundImage.src = "../image/back.jpg";
                // ctx.drawImage(backgroundImage, 0, 0, MAP_SETTINGS._WIDTH, MAP_SETTINGS._HEIGHT);
            
                // 배경 타일
                // console.log(tile);
                for(let y = 0; y < MAP_SETTINGS._HEIGHT; y += TILE_LENGTH){
                    for(let x = 0; x < MAP_SETTINGS._WIDTH; x += TILE_LENGTH){
                            contextBackground.drawImage(tile, x, y, TILE_LENGTH, TILE_LENGTH);
                    };
                };
            }
            
            
            
            function convertNumToTileRowCol(num) {
                let arr = []
                let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
                let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
                arr[0] = row
                arr[1] = col
                return arr;
            }
    
            function drawBlockZone(area, ctx_obj) { 
                console.log('drawBlockZone');
                let arr = area;
                for(let i =0; i< arr.length; i++) {
                    let tile_row_col = convertNumToTileRowCol(arr[i]) 
                    let pixel_x = (tile_row_col[1] - 1) * TILE_LENGTH;
                    let pixel_y = (tile_row_col[0] - 1) * TILE_LENGTH;
                    ctx_obj.fillStyle = "black";
                    ctx_obj.fillRect(pixel_x, pixel_y, TILE_LENGTH, TILE_LENGTH);
                }
            //--------------------------tmp----------------------
                ctx_obj.drawImage(among, 
                    0 * TILE_LENGTH,
                    19 * TILE_LENGTH,
                    TILE_LENGTH,
                    TILE_LENGTH
                );
            //--------------------------tmp----------------------
            }
    
            /* Canvas 세팅 후 추가 */
            canvasBackground.setAttribute("width", MAP_SETTINGS._WIDTH);
            canvasBackground.setAttribute("height", MAP_SETTINGS._HEIGHT);
            document.body.appendChild(canvasBackground);
            canvasObject.setAttribute("width", MAP_SETTINGS._WIDTH);
            canvasObject.setAttribute("height", MAP_SETTINGS._HEIGHT);
            document.body.appendChild(canvasObject);

            
    
            /* 기타 변수 localStorage에 추가 */
            localStorage.setItem('BLOCKED_AREA', MAP_SETTINGS._BLOCKED_AREA);
            localStorage.setItem('Invite_url', 'https://getinhere.me/?room=' + this.state.roomName); //! roomName => this.state.roomName
            
            /* Canvas Draw 함수 */
            // getTileAndDrawBackground(contextBackground, MAP_SETTINGS);
            //! 이미지를 찾거든 여기를!
            const tile = new Image();
            tile.onload = () => {
                drawBackground(contextBackground, MAP_SETTINGS, tile);
            };
            tile.src = this.state.characterList.tile;
            //END
            drawBlockZone(localStorage.getItem('BLOCKED_AREA').split(','), contextObject);
        });
    }

    pagePresetChange = () => { this.setState({pagePreset : 1}) }        
    
    render() {
        let frontPage;
        if (this.state.pagePreset === 0) {
            frontPage =  <PresetPage pagePreset={this.pagePresetChange}></PresetPage>//배경, 오브젝트(음악파일도 미리 받기), 내화면, 토글
        } else {
            frontPage = <RoomPage MAP_SETTINGS={this.state.map}></RoomPage>// 움직이는 애들/동영상/채팅창
        }
        return (
            <>
            {frontPage}
            </>

        )
        
    }
}

export default Main;