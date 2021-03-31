import React, { Component } from 'react';

class faceMode extends Component {

  componentDidMount() {
    let photoBooth = document.querySelector("#video.video-preview") //  프리뷰 비디오
    let photoCanvas = document.querySelector('.photo-canvas')
    let ctx = photoCanvas.getContext("2d")
    ctx.filter = 'brightness(1.2)' //필터기능(밝게)
    let cw = photoCanvas.clientWidth;  // 여기서 이렇게 drawImage 기강을 잡아놓는다
    let ch = photoCanvas.clientHeight; // 여기서 이렇게 drawImage 기강을 잡아놓는다

      let doOnceFlag = true;
      if (doOnceFlag) {
        doOnceFlag = false;
      } else {
        return;
      }

      // 비디오는 play 되고서야 비로소 제 크기를 찾게 된다. 그래서 clientHeight를 play 후에 구해야한다
      let ph = photoBooth.clientHeight;
      let pw = photoBooth.clientWidth;
      photoCanvas.style.height = `${ph}px`; 
      photoCanvas.style.width = `${pw/2}px`;
      photoCanvas.style.borderRadius = `30%`;


      (function drawHeadZone() {
     
        ctx.drawImage(photoBooth,pw*1.3,ph/5,cw*1.6,ch*3, 0, 0, cw, ch); 
        requestAnimationFrame(drawHeadZone);
      })()
  }

  render() {
    let faceModeCanvasStyle = {
      "transform": "rotateY(180deg)",
      "WebkitTransform": "rotateY(180deg)",
      "position": "relative",
    }
    return (
      <canvas className="photo-canvas" style={faceModeCanvasStyle}> </canvas>
    );
  }
}

export default faceMode;