import React, {Component} from 'react'
import axios from 'axios';

class LandingPage extends Component {

    componentDidMount = () =>{
        axios.get('/api/mapList')
        .then(response => {
            this.setState({maps : response.data.mapList})
        });
    }
    
    state = {
        map_index : 0,
        maps : [],
    }

    mapIndexSend = async () => {
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
        
    }

    MapLeft = () =>{
        this.setState( state => ({map_index: state.map_index -1}));
        if (this.state.map_index === 0) {
            this.setState( state => ({map_index: state.map_index + state.maps.length }));
        }
    };
    
    MapRight = () =>{
        this.setState(state => ({map_index: state.map_index +1}));
        if (this.state.map_index+1 === this.state.maps.length) {
            this.setState(state => ({map_index: state.map_index - state.map_index}))
        }
    };

    render(){
        return (
            <>
            <img className="map-image" alt="maps" src={this.state.maps[this.state.map_index]}></img>
            <div className="main-message">
                Get In Here 🍻
            </div>
            <div className="map-setting">
                <button className="map-select-button" onClick={this.MapLeft}>
                    <i className="far fa-hand-point-left">&lt;</i>
                </button>
                Choose map
                <button className="map-select-button" onClick={this.MapRight}>
                    <i className="far fa-hand-point-right">&gt;</i>
                </button>
            </div>
            <button className="start-button" onClick={this.mapIndexSend}>Start!</button>
            </>
        )
    }
}

export default LandingPage