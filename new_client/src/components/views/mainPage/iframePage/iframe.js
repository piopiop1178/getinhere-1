import React, { Component } from 'react';

import './iframe.css'
import IframeGame from './iframeGame';

class IframePage extends Component {
  state = {
    gameNumber: 0,
  }

  componentDidMount = () => {
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

  returnMenu= () => {
      this.setState({gameNumber : 0})
  }

  runGame1 = () => {
    this.setState({gameNumber : 1})
  }
  runGame2 = () => {
    this.setState({gameNumber : 2})
  }
  runGame3 = () => {
    this.setState({gameNumber : 3})
  }
  runGame4 = () => {
    this.setState({gameNumber : 4})
  }
  runGame5 = () => {
    this.setState({gameNumber : 5})
  }
  runGame6 = () => {
    this.setState({gameNumber : 6})
  }

  render() {
    return (
      <>
        <div className='iframe-wrapper'>
            <div className="right-buttons">
                <div><button className='iframe-close-button' onClick={this.closeIframe}>돌아가기</button></div>
                <div><button className="go-to-iframegamemenu-button" onClick={this.returnMenu}>다른 게임하기</button></div>
            </div>
            <IframeGame
                gameNumber={this.state.gameNumber}
                runGame1={this.runGame1}
                runGame2={this.runGame2}
                runGame3={this.runGame3}
                runGame4={this.runGame4}
                runGame5={this.runGame5}
                runGame6={this.runGame6}
                />
        </div>
      </>
    )
  }
}

export default IframePage;
