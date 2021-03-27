import React, { Component } from 'react';
import DeviceSelector from './deviceSelector';
import VideoPreview from './videoPreview';
import axios from 'axios';
import {Link} from 'react-router-dom';

class PresetPage extends Component {
    state = {
        characterNum : 0,
        images: [],
        userName: "이름을 입력해주세요",
    }

    componentDidMount = () => {
        axios.get('/api/characterList')
        .then(response => {
            this.setState({images: response.data.characterList});
            // console.log(this.state.images);
        });
    }

    imageChangeLeft = () => {
        this.setState(state => ({characterNum: state.characterNum - 1}))
        if (this.state.characterNum === 0) {
            this.setState(state=> ({characterNum: state.characterNum + state.images.length - 1}));
        }
    }
    imageChangeRight = () => {
        this.setState(state => ({characterNum: state.characterNum + 1}))
        if (this.state.characterNum+1 === this.state.images.length) {
            this.setState(state => ({characterNum: state.characterNum - state.characterNum}));
        }
    }

    presetSend = () => {
        this.props.joinRoom(this.state.userName, this.state.characterNum);
        // console.log(this.state);
        // axios.get('/api/preset', {
        //     params: { 
        //         userName : this.state.userName,
        //         characterNum : this.state.characterNum
        //         }
        //     })
        // .then( response => console.log(response.data));
    }

    inputChange = e =>{
        const target = e.target;
        this.setState({userName : target.value})
        // console.log(this.state.userName);
    }

    render() {
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
                            <i className="far fa-hand-point-left"></i>&lt;</button>
                        <button className="character-select-button" onClick={this.imageChangeRight}>
                            <i className="far fa-hand-point-right"></i>&gt;</button>
                    </div>
                    <div className="character-box"> 
                        CHARACTER
                        <div className="character-image">
                            <img alt="character" src={this.state.images[this.state.characterNum]}></img>                      
                        </div>
                    </div>
                </div>
                <div className="between"></div>

                <div className="item2">
                    <VideoPreview />
                    <DeviceSelector/>
                </div>
            </div>
            <button className="getin-button" onClick={this.presetSend}>
                GET IN !
            </button>
            </div>
        );
    }
}
  

export default PresetPage
