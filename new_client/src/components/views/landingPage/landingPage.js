import React, {Component} from 'react'
import axios from 'axios';
import './landingPage.css'
import video from './video/landingPage_withoutFace.mov'

class LandingPage extends Component {

    state = {
        map_index : 0,
        maps : [],
    }

    componentDidMount = () =>{
        axios.get('/api/mapList')
        .then(response => {
            this.setState({maps : response.data.mapList})
        });
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