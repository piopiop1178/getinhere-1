import React, { Component } from 'react';
import DeviceSelector from './deviceSelector';
import VideoPreview from './videoPreview';
import FaceMode from './faceMode/faceMode';
import axios from 'axios';

class PresetPage extends Component {
    state = {
        characterNum : 0,
        characterList: [],
        userName: "이름을 입력해주세요",
        refresh: 0,
        ctx: null,
    }



    componentDidMount = () => {
        axios.get('/api/characterList')
        .then(response => {
            this.setState({characterList: response.data.characterList});
        });
    }

    imageChangeLeft = () => {
        this.setState(state => ({characterNum: state.characterNum - 1}))
        if (this.state.characterNum === 0) {
            this.setState(state=> ({characterNum: state.characterList.length})); //0 이면 길이만큼으로 간다
        }
    }
    imageChangeRight = () => {
        this.setState(state => ({characterNum: state.characterNum + 1}))
        if (this.state.characterNum+1 === this.state.characterList.length + 1) {
            this.setState(state => ({characterNum: 0}));
        }
    }

    finishPreset = () => {
        if(this.state.userName == ""){
            alert("이름을 입력해주세요");
            return;
        }
        if(this.state.userName.length < 2){
            alert("이름은 2자 이상 입니다");
            return;
        }
        if(this.state.userName.length > 14){
            alert("이름은 14자 이내 입니다");
            return;
        }
        // const regex = /^[가-힣a-zA-z0-9]{2,15}$/;    // 특수문자 미포함
        const regex = /^[가-힣a-zA-z0-9\{\}\[\]\/?.,;:|\)*~`!^\-_+@\#$%&\\\=\(\'\"]{2,15}$/;
        if(!regex.test(this.state.userName)){
            alert("이름은 한글, 영문, 숫자, 일부 특수문자( \{\}\[\]\/?.,;:|\)*~`!^\-_+@\#$%&\\\=\(\'\" )만 가능합니다");
            return;
        }

        this.props.finishPreset(this.state.userName, this.state.characterNum);
    }

    inputChange = e =>{
        const target = e.target;
        this.setState({userName : target.value})
    }

    render() {
        let characterImage = null;
        let faceModeCanvasStyle = {
            "transform": "rotateY(180deg)",
            "WebkitTransform": "rotateY(180deg)",
            "position": "relative",
        }
        if (this.state.characterNum < this.state.characterList.length) {
            characterImage = <img alt="character" src={this.state.characterList[this.state.characterNum]}></img>                      
        } else {
            // characterImage = <canvas ref={this.canvasRef} className="photo-canvas" style={faceModeCanvasStyle}> </canvas>
            characterImage = <FaceMode/>
        }
        return (
            <div id="preset">
            <div className="container">
                <div className="item1">
                    <div className="name-box">
                        <span className="name-input"> NAME : </span>
                        <input onChange={this.inputChange} placeholder="_____________" className="name-input name-input2"></input>
                    </div>
                    <div className="charcter-changer">
                        <button className="character-select-button" onClick={this.imageChangeLeft}>
                            <i className="far fa-hand-point-left"></i></button>
                        <button className="character-select-button" onClick={this.imageChangeRight}>
                            <i className="far fa-hand-point-right"></i></button>
                    </div>
                    <div className="character-box"> 
                        CHARACTER
                        <div className="character-image">
                        {characterImage}
                        </div>
                    </div>
                </div>
                <div className="between"></div>

                <div className="item2">
                    <VideoPreview />
                    <DeviceSelector/>
                </div>
            </div>
            <button className="getin-button" onClick={this.finishPreset}>
                GET IN !
            </button>
            </div>
        );
    }
}
  

export default PresetPage
