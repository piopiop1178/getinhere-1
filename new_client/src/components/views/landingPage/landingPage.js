import React, {Component} from 'react'
import axios from 'axios';
import './landingPage.css'
import video from './video/landingPage_withoutFace.mov'

class LandingPage extends Component {

    state = {
        map_index : 0,
        maps : [],
        mobileOrNocameraOrNochrome : false,
    }

    componentDidMount = () =>{
        axios.get('/api/mapList')
        .then(response => {
            this.setState({maps : response.data.mapList})
        });

        this.mobileOrNocameraOrNochromeBan();
    }

    mobileOrNocameraOrNochromeBan = () => {
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
        
        if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) {
            //mobile
            this.setState({mobileOrNocameraOrNochrome:true});
            alert("현재는 카메라가 있는 노트북이나 데스크탑에서만 이용이 가능합니다. 다음 버전을 기대해주세요 !");
        }
        else if (navigator.userAgent.toLowerCase().indexOf("chrome") === -1
                || (navigator.appName === 'Netscape' && navigator.userAgent.toLowerCase().indexOf('trident') !== -1)
                // || agent.indexOf("msie") !== -1
            ){
            alert("현재는 크롬(Chrome)브라우저에서만 지원하고 있습니다. 다음 버전을 기대해주세요 !");
            this.setState({mobileOrNocameraOrNochrome:true});
        }
        else{
            navigator.mediaDevices.getUserMedia(constraints)
            .catch( () => {
                this.setState({mobileOrNocameraOrNochrome:true});
                alert("현재는 카메라가 있는 노트북이나 데스크탑에서만 이용이 가능합니다. 다음 버전을 기대해주세요 !");
            });
            // this.otherBrowserBan();
        }

    }

    mapIndexSend = () => {
        console.log('mapIndexSend Get in 버튼을 눌렀습니다')
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
        let startButton
        if (this.state.mobileOrNocameraOrNochrome){
            startButton = <button className="start-button" onClick={window.close}>SEE YOU !</button>
        }
        else {
            startButton = <button className="start-button" onClick={this.mapIndexSend}>START !</button>
        }
        return (
            <>
            <video className="landing-video" muted autoPlay loop>
                <source src={video} type="video/mp4" />
                <strong>Your browser does not support the video tag.</strong>
            </video>
            {/* <img className="map-image" alt="maps" src={this.state.maps[this.state.map_index]}></img> */}
            <div className="main-message">
                GET IN HERE 🍻
            </div>
            {/* <div className="map-setting">
                <button className="map-select-button" onClick={this.MapLeft}>
                    <i className="far fa-hand-point-left"></i>
                </button>
                CHOOSE MAP
                <button className="map-select-button" onClick={this.MapRight}>
                    <i className="far fa-hand-point-right"></i>
                </button>
            </div> */}
            {startButton}
            </>
        )
    }
}

export default LandingPage