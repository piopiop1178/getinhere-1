import React, { Component } from 'react';
import DeviceSelector from './deviceSelector';
import VideoPreview from './videoPreview';
import FaceMode from './faceMode/faceMode';
import axios from 'axios';
import LandingPage from '../landingPage/landingPage';



export class LoadingPage extends Component {
    render() {
        const landingPageStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: "0px",
            left: "0px",
            width: "100vw",
            height: "100vh",
            backgroundColor: "white",
            zIndex: "10",
        }

        return (
            <div className="loading" id="loading" style={landingPageStyle}>
                <img src="/images/Spinner.gif"></img>
            </div>
        );
    }
}

export class LoadingPage2 extends Component {
    render() {
        const landingPageStyle = {
            display: "flex",
            justifyContent: "center",
            position: "fixed",
            bottom: "0px",
            left: "0px",
            width: "87vw",
            height: "78vh",
            backgroundColor: "white",
            zIndex: "5",
        }

        return (
            <div className="loading" id="loading" style={landingPageStyle}>
                <img src="/images/Spinner.gif"></img>
            </div>
        );
    }
}




export class PresetPage extends Component {
    state = {
        characterNum : 0,
        characterList: [],
        userName: "",
        refresh: 0,
        ctx: null,
        photoCanvas: document.querySelector('.photo-canvas')
    }    
    componentDidMount = () => {
        axios.get('/api/characterList')
        .then(response => {
            this.setState({characterList: response.data.characterList});
            // console.log(this.state.characterList);
        });
        this.state.photoCanvas = document.querySelector('.photo-canvas');
    }

    imageChangeLeft = () => {
        this.setState(state => ({characterNum: state.characterNum - 1}))
        if (this.state.characterNum === 0) {
            this.setState(state=> ({characterNum: state.characterList.length}));
        }
    }
    imageChangeRight = () => {
        this.setState(state => ({characterNum: state.characterNum + 1}))
        if (this.state.characterNum+1 === this.state.characterList.length + 1) {
            this.setState(state => ({characterNum: 0}));
        }
    }

    finishPreset = (e) => {
        axios.get('/api/usersCount', {
            params: { 
                roomName : this.props.roomName,
            }
        })
        .then(response => {
            // console.log(response.data.usersCount);
            // if(response.data.success === false){
            //     this.props.goBack("유효하지 않은 방입니다.\n(유저가 없는 방은 30초 이후에 삭제됩니다)");
            // }
            if(response.data.usersCount > 8) {
                this.props.goBack("방이 꽉 찼습니다");
                return;
            }
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
            const regex = /^[ㄱ-ㅎ가-힣a-zA-z0-9\{\}\[\]\/?.,;:|\)*~`!^\-_+@\#$%&\\\=\(\'\"]{2,15}$/;
            if(!regex.test(this.state.userName)){
                alert("이름은 한글, 영문, 숫자, 일부 특수문자( (){}[]?.,;:|*~`!^-_+@#$%&\\='\" )만 가능합니다");
                return;
            }
    
            let pc = document.querySelector('.photo-canvas');
        !pc ? this.props.finishPreset(this.state.userName, this.state.characterNum, null) : this.props.finishPreset(this.state.userName, this.state.characterNum, pc.toDataURL());
        FaceMode.stopAnimation();
        });
    }

    inputChange = e =>{
        const target = e.target;
        this.setState({userName : target.value})
    }

    loadingFinished = () => {
        this.props.loadingFinished();
        this.setState({characterNum: this.state.characterList.length});
        
    } // mainPage->presetPage->videoPage로 함수 전달됨

    render() {
        let characterImage = null;
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
                        <div className="character-image">
                            {characterImage}
                        </div>
                    </div>
                </div>
                <div className="between"></div>

                <div className="item2">
                    <VideoPreview loadingFinished={this.loadingFinished} />
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
  

export default {PresetPage, LoadingPage, LoadingPage2}
