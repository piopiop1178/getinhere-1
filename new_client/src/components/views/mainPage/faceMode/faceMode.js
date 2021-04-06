import React, { Component } from 'react';

let requestId;

class faceMode extends Component {
  
  componentDidMount() {
    let photoBooth = document.querySelector("#video.video-preview") //  프리뷰 비디오
    let photoCanvas = document.querySelector('.photo-canvas')
    let ctx = photoCanvas.getContext("2d")
    ctx.filter = 'brightness(1.2)' //필터기능(밝게)
  
    photoCanvas.width  = 100;
    photoCanvas.height = 100;

    let doOnceFlag = true;
    if (doOnceFlag) {
      doOnceFlag = false;
    } else {
      return;
    }

    let videoWidth =  photoBooth.videoWidth;
    let videoHeight = photoBooth.videoHeight;
    photoCanvas.style.height = `${photoBooth.clientHeight}px`;
    photoCanvas.style.width = `${photoBooth.clientHeight}px`;

    function drawHeadZone(){
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(photoBooth, videoWidth/3, videoHeight/5, videoWidth/3, videoWidth/3,  0, 0, 100, 100); 
      console.log(`!! ${requestId}`)
      requestId = requestAnimationFrame(drawHeadZone);
    }

    requestId = requestAnimationFrame(drawHeadZone);
  }

  static stopAnimation(){
    console.log(requestId - 1);
    cancelAnimationFrame(requestId - 1);
    cancelAnimationFrame(requestId);
    cancelAnimationFrame(requestId + 1);
  }
  

  render() {
    let faceModeCanvasStyle = {
      "transform": "rotateY(180deg)",
      "WebkitTransform": "rotateY(180deg)",
      "position": "relative",
      "border": "none",
    }
    return (
      <canvas className="photo-canvas" style={faceModeCanvasStyle}> </canvas>
    );
  }
}

export default faceMode;