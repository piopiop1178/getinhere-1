import React, { Component } from 'react';
import image1 from '../../../images/1.jpg'
import image2 from '../../../images/2.png'
import image3 from '../../../images/3.png'
import image4 from '../../../images/4.png'
import image5 from '../../../images/5.png'
import image6 from '../../../images/6.png'
import image7 from '../../../images/7.png'
import DeviceSelector from './deviceSelector';
import VideoPreview from './videoPreview';
import {Link} from 'react-router-dom';

class PresetPage extends Component {
    state = {
        index : 0,
        images: [image1, image2, image3, image4, image5, image6, image7]
    }
    
    imageChangeLeft = () => {
        this.setState({index: this.state.index -1});
        if (this.state.index === 0) {
            this.setState({index: this.state.index + this.state.images.length - 1});
        }
    }
    imageChangeRight = () => {
        this.setState({index: this.state.index +1});
        if (this.state.index+1 === this.state.images.length) {
            this.setState({index: this.state.index - this.state.index});
        }
    }

    render() {
        return (
            <>
            <div className="container">
                <div className="item1">
                    <div className="name-box">
                        <span className="name-input"> NAME : </span>
                        <input placeholder="_____________" className="name-input name-input2"></input>
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
                            <img alt="character" src={this.state.images[this.state.index]}></img>                      
                        </div>
                    </div>
                </div>
                <div className="between"></div>

                <div className="item2">
                    <VideoPreview />
                    <DeviceSelector/>
                </div>
            </div>
            <button className="getin-button">
                <Link className="getin-link" to ="/room">
                    GET IN !
                    {/* 이 버튼 누르면, ① 사용자 Name, ② Character 정보, ③ Devices 정보 넘겨주면서 생성해둔 방에 들어가야 된다.  */}
                </Link>
            </button>
            
            </>
        );
    }
}
  

export default PresetPage
