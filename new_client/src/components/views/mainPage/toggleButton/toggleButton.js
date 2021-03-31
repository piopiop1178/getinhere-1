import React, { Component } from 'react';

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
    let notice = document.querySelector('.invite-toggle-notice')
    notice.style.display = "block";

    setTimeout(()=>{
      notice.style.display = "none";
    }, 1000)
  }

  toggleChat = () => {
    const chatBox = document.getElementById("chat-box");
    // if 
    // chatBox.setAttribute("display", "none");

  }

  render() {
    return (
      <div className="toggles">
          <div className="chat-toggle" onClick={this.toggleChat}>📢</div>
          <div className="invite-toggle"  onClick={this.copyInviteLinkToClipboard}>👨‍👩‍👦 Get In!</div>
          <div className="invite-toggle-notice"> Invite Link Copied! </div>
          <div className="etc-toggle">🔧</div>
      </div>
    );
  }
}

export default toggleButton;