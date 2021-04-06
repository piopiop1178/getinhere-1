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
        
        let filter = "win16|win32|win64|mac|macintel";
        if ( navigator.platform ) {
            if ( filter.indexOf( navigator.platform.toLowerCase() ) >= 0 ) {
                navigator.mediaDevices.getUserMedia(constraints)
                .catch( (e) => alert(`카메라 상태를 확인해주세요 !`))
                // .catch( (e) => alert(`카메라 상태를 확인해주세요 !${e}`))
                .then(stream => {
                    // console.log('Received local stream');
                    video.srcObject = stream;
                })
            }
        }

        video.addEventListener('play', () => {
            setTimeout(() => this.props.loadingFinished(), 1500);
        }) // mainPage->presetPage->videoPage로 함수 전달됨

        setTimeout(() => this.props.loadingFinished(), 5000);
    }
    
    render() {
        return (
            <video className="video-preview" id="video" autoPlay muted></video>
            // <video ref={this.videoPrev} className="video-preview" id="video" autoPlay ></video>
        );
    
    }
}

// function VideoPreview() {

//     let constraints = {
//         video: {
//             width: {
//                 max: 1280,
//                 ideal: 720
//             },
//             height: {
//                 max: 720,
//                 ideal: 480
//             }
//         }
//     }
      
//     const video = document.querySelector('video');
    
//     navigator.mediaDevices.getUserMedia(constraints).then(stream => {
//         console.log('Received local stream');
//         video.srcObject = stream;
//     }).catch(e => alert(`getusermedia error ${e.name}`))


//     return (
//         <video className="video-preview" id="video" autoPlay ></video>
//     );
// };

export default VideoPreview;