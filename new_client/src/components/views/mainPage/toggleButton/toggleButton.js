import React, { Component } from 'react';

let swal = window.swal;
class toggleButton extends Component {


  componentDidMount = () => {
        /* Copy Invite_url to my Clipboard */
  }

  copyInviteLinkToClipboard = () => {
    let body = document.querySelector('body')
    let tmptextarea = document.createElement('textarea')
    tmptextarea.setAttribute('class','tmptextarea')
    body.appendChild(tmptextarea)
    tmptextarea.textContent = document.location.href;
    tmptextarea.select()
    document.execCommand('copy')
    body.removeChild(tmptextarea)
    // let notice = document.querySelector('.invite-toggle-notice')
    // notice.style.display = "block";
    swal("초대링크가 클립보드에 복사되었습니다")
    // setTimeout(()=>{
    //   notice.style.display = "none";
    // }, 1000)
  }

  guidanceOnOff = () => {
    // const chatBox = document.getElementById("chat-box");
    // if 
    // chatBox.setAttribute("display", "none");
    this.props.guidanceOnOff()
  }

  render() {
    return (
      <div className="toggles">
          <div className="chat-toggle" onClick={this.guidanceOnOff}>❓</div>
          <div className="invite-toggle"  onClick={this.copyInviteLinkToClipboard}>👨‍👩‍👦Invite</div>
          {/* <div className="invite-toggle-notice"> Invite Link Copied! </div> */}
          <div className="screen-toggle" onClick={this.props.screenShare}>💻</div>
          {/* <div className="etc-toggle">🔧</div> */}
      </div>
    );
  }
}

export default toggleButton;