import React, {Component} from 'react'
import axios from 'axios';
import './landingPage.css'
import video from './video/landingPage_withoutFace.mov'

class LandingPage extends Component {

    state = {
        map_index : 0,
        maps : [],
        mobileOrNocamera : false,
    }

    componentDidMount = () =>{
        axios.get('/api/mapList')
        .then(response => {
            this.setState({maps : response.data.mapList})
        });

        this.mobileOrNocameraBan();
    }

    mobileOrNocameraBan = () => {
        let filter = "win16|win32|win64|mac|macintel";
        let constraints = {
            video: {
                width: {
                    max: 1280,
                    ideal: 720
                },
                height: {
                    max: 720,
                    ideal: 480
                }
            }
        }
        
        if ( navigator.platform) {
            if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) {
                //mobile
                alert("현재는 카메라가 있는 노트북이나 데스크탑에서만 이용이 가능합니다. 다음 버전을 기대해주세요 !");
                this.setState({mobileOrNocamera:true});
            }
            else{
                navigator.mediaDevices.getUserMedia(constraints).then( () => {
                }).catch( () => {
                    alert("현재는 카메라가 있는 노트북이나 데스크탑에서만 이용이 가능합니다. 다음 버전을 기대해주세요 !")
                    this.setState({mobileOrNocamera:true});
                });
            }
        }
    }

    mapIndexSend = () => {
        axios.get('/api/mapIndex', {
            params: { 
                mapIndex : this.state.map_index}
            })
        .then( response => {
            const { history } = this.props;
            history.push({
                pathname: `/room/${response.data.roomName}`,
            });
        });
    };

    MapLeft = () =>{
        console.log(this.state.map_index - 1);
        this.setState( state => ({map_index: state.map_index -1}));
        if (this.state.map_index === 0) {
            this.setState( state => ({map_index: state.map_index + state.maps.length }));
        }
    };
    
    MapRight = () =>{
        console.log(this.state.map_index + 1);
        this.setState(state => ({map_index: state.map_index +1}));
        if (this.state.map_index+1 === this.state.maps.length) {
            this.setState(state => ({map_index: state.map_index - state.map_index}))
        }
    };

    render(){
        return (
            <>
            <video className="landing-video" muted autoPlay loop>
                <source src={video} type="video/mp4" />
                <strong>Your browser does not support the video tag.</strong>
            </video>
            <img className="map-image" alt="maps" src={this.state.maps[this.state.map_index]}></img>
            <div className="main-message">
                GET IN HERE 🍻
            </div>
            <div className="map-setting">
                <button className="map-select-button" onClick={this.MapLeft}>
                    <i className="far fa-hand-point-left"></i>
                </button>
                CHOOSE MAP
                <button className="map-select-button" onClick={this.MapRight}>
                    <i className="far fa-hand-point-right"></i>
                </button>
            </div>
            <button className="start-button" onClick={this.mapIndexSend}>START !</button>
            </>
        )
    }
}

export default LandingPage