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

        async function checkCamera(){
            let deviceList=[] ;
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    devices.forEach(device => {deviceList.push(device.kind);
                });
                if (deviceList.indexOf("videoinput") < 0){
                    window.location.href="/"
                }
            })
            await navigator.mediaDevices.getUserMedia(constraints)
                // .catch( (e) => alert(`카메라 상태를 확인해주세요 !`))
                .then(stream => {
                    // console.log('Received local stream');
                    video.srcObject = stream;
                })
        }

        const video = document.querySelector('video');
        
        checkCamera();

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