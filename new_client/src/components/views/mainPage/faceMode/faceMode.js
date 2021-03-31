import React, { Component } from 'react';


let Once = true;
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
      photoCanvas.style.height = `${ph}px`; // 세미콜론 필수다
      photoCanvas.style.width = `${pw/2}px`;
      photoCanvas.style.borderRadius = `30%`;
      // photoCanvas.height = `${ph}px`;
      // photoCanvas.width  = `${pw/2}px`;
      // photoCanvas.style.height = `${ph}px`; // 세미콜론 필수다
      // photoCanvas.style.width = `${pw}px`;

      (function drawHeadZone() {
        // ctx.beginPath()
        // let x = cw / 2; // center x of circle
        // let y = ch / 2-10 ; // center y of circle
        // let r = 70; // radius
        // let angle = 150;
        // let neck_thickness = -1;
        // let neck_length = 80
        // ctx.arc(x, y, r, 0,  2*Math.PI );
        // ctx.arc(x, y, r, (angle) * (Math.PI / 180), (180 - angle) * (Math.PI / 180));
        // ctx.lineTo(x + r * Math.sin(angle * Math.PI / 180) + neck_thickness, y + neck_length)
        // ctx.lineTo(x - r * Math.sin(angle * Math.PI / 180) - neck_thickness, y + neck_length)
        // ctx.closePath()
        // ctx.strokeStyle = 'white'
        // ctx.lineWidth = 5;
        // ctx.stroke();
        // ctx.clip()
        ctx.drawImage(photoBooth,pw*1.3,ph/5,cw*1.6,ch*3, 0, 0, cw, ch); // 이렇게해야 꽉 차게 나온다
        requestAnimationFrame(drawHeadZone);
      })()
  



  }

  render() {
    let faceModeCanvasStyle = {
      "transform": "rotateY(180deg)",
      // "-webkit-transform": "rotateY(180deg)",
      "WebkitTransform": "rotateY(180deg)",
      "position": "relative",
      // "border": "none",
    }
    return (
      <canvas className="photo-canvas" style={faceModeCanvasStyle}> </canvas>
    );
  }
}

export default faceMode;
