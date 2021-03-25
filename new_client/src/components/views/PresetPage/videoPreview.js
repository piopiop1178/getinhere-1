import React, { Component } from 'react';

class VideoPreview extends Component {

    // constructor(props){
    //     super(props);
    //     this.videoPrev = React.createRef();
    // }

    componentDidMount(){
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
        
        const video = document.querySelector('video');
        
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            // console.log('Received local stream');
            // video.srcObject = stream;
            video.srcObject = stream;
            // this.current.videoPrev.srcObject = stream;
        }).catch(e => alert(`getusermedia error ${e.name}`))
    }
    
    render() {
        return (
            // <video className="video-preview" id="video" autoPlay ></video>
            <video ref={this.videoPrev} className="video-preview" id="video" autoPlay ></video>
        );
    
    }
}


export default VideoPreview;