import React, { Component } from 'react';
import './youtubeIframe.css'

class YoutubeIframe extends Component {

    closeButton=() => {
        this.props.closeButton()
    }
    
    componentDidMount = () => {
        this.props.updatePositionSocketOff()
    }

    render() {
        return (
            <div className="youtubeIframe">
                <button className="closeButton" onClick={this.closeButton}>그만보기</button>
                <div id="player1" className="player1"></div>
            </div>
        );
    }
}

export default YoutubeIframe;