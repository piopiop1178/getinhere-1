import React, {Component} from 'react';
import {io} from 'socket.io-client';
// import tile2 from '../../../images/tile2.jpg'
// import among2 from '../../../images/among.jpg'


const socket = io.connect("https://localhost", {transport : ['websocket']});
// let socket = io("localhost:3000/room");

class RoomPage extends Component {
    
    state = {
        userid: "wow",
    }

    componentDidMount() {
        socket.emit('hello', 'hello');
        console.log("wow~");
        socket.on('hello', data => {console.log (data)});
    }

    render(){
        return (
            <div>hello~
            </div>
        )
    }
}

export default RoomPage

                