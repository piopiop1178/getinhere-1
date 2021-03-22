import React, {Component} from 'react'
// import axios from 'axios';
import {Link} from 'react-router-dom';

class LandingPage extends Component {
    // useEffect(() => {
    //     axios.get('/api/hello')
    //     .then(response => console.log(response.data))
    // }, []);

    MapLeft = () =>{
        console.log("map left")
        // db에서?서버에서? map정보를 불러온다.
    };
    MapRight = () =>{
        console.log("map right")
        // db에서?서버에서? map정보를 불러온다.
    };

    render(){
        return (
            <>
            <div className="main-message">
                Get In Here 🍻
            </div>
            <div className="map-setting">
                <button className="map-select-button" onClick={this.MapLeft}>
                    <i className="far fa-hand-point-left"></i>
                </button>
                Choose map
                <button className="map-select-button" onClick={this.MapRight}>
                    <i className="far fa-hand-point-right"></i>
                </button>
            </div>
            <button className="start-button">
                <Link className="start-link" to="/preset"> Start ! </Link>
                {/* 이 버튼을 누르면, ①Map 정보를 넘겨주고, ② room을 생성해놓고 room 정보까지 넘겨줘야 한다. */}
            </button>
            </>
        )
    }
}

export default LandingPage