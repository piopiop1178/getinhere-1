import React, { Component } from 'react';
import './iframe.css'

class IframePage extends Component {

  componentDidMount = () => {
      // console.log('iframe.js is on')
      this.props.updatePositionSocketOff()
  }

  closeIframe = () => {
    this.props.updatePositionSocketOn()
    this.props.closeIframe();
  }

  inviteCodeButton = () => {
    document.querySelector('#iframe-game').src = document.querySelector('.invite-code-input').value;
    document.querySelector('.invite-code-input').value = "";
  }

  render() {
    return (
      <div className='iframe-wrapper'>
          <div className="invite-code-wrapper">
              <input type="text" className="invite-code-input" placeholder="   초대 코드를 입력해주세요  Input your Invite Code"/> 
              <button className="invite-code-button" onClick={this.inviteCodeButton}> JOIN </button>
              <span className="iframe-game-guide"> 초대 코드 입력 후 Play 버튼을 눌러주세요! </span>
              <button className='iframe-close-button' onClick={this.closeIframe}>❌</button>
          </div>
          <iframe id='iframe-game' src="https://skribbl.io" ></iframe>
      </div>
    )
  }
}

export default IframePage;
