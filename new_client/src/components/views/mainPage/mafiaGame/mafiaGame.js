import React, { Component } from 'react';

class mafiaGame extends Component {
  state = {
    isMafiaGameOn: false,
    isMafiaGameStarted: false,
    selectedPlayerSocketId: '',
    playerNumber: 0,
    faceList: [],
    amIAlive: true,
    deadPlayers: [],
    liveOrDieModalOnOff: false,
    myRole: '',
    alreadySendJoinMafiaGame: false,
  }
  socket = this.props.socket;
  
  myRoleRef = React.createRef();
  playerButtonRef = React.createRef();

  addCharacterInfoInGame = (socketId) => {
      let newPlayer = document.querySelector(`[data-player-number='${this.state.playerNumber+1}']`);
      newPlayer.setAttribute("data-set-socketid", socketId);
      newPlayer.dataset.socketid = socketId ? socketId : '00' ;
      this.state.playerNumber += 1;
      
      /* 이미지 추가하기  1안, 2안, 둘다 잘 된다. 2안을 통해서 style을 조정할 수 있어 보인다. */
      // newPlayer.parentNode.appendChild(this.state.faceList[socketId]); //tmp 1안: Image 객체를 바로 추가하기

      let playerImage = document.createElement('img'); //tmp 2안: createElement로 img 만들어서 추가하기
      let playerNickName = document.createElement('span'); //tmp 2안: createElement로 img 만들어서 추가하기
      let characterNumber;

      if (this.state.faceList[socketId] != undefined) {
        playerImage.src = this.state.faceList[socketId].src;
      } else {
        characterNumber = this.props.characterNumberBySocketid[socketId]
        playerImage.src = this.props.characterList[this.props.characterNumberBySocketid[socketId]].src;
      }
      playerImage.style.width = '50px'
      playerNickName.innerText = this.props.nicknameBySocketid[socketId];
      newPlayer.appendChild(playerImage);
      newPlayer.appendChild(playerNickName);
  }

  joinMafiaGame = async () => {
    /* MG-01. 마피아 게임 창을 띄운다 */
    /* MG-02. 마피아 게임을 위한 socket 세팅을 완료하고 게임 참여를 알린다 */
    await this.initMafiaGame();     // 마피아 게임을 위한 socket on
    this.socket.emit("joinMafiaGame");   // 게임 참여 알림
  }

  initMafiaGame = async () =>{
      /* MG-05. 신규 플레이어의 비디오를 추가한다 */
      /* (내가 먼저 입장)새로 접속한 유저의 정보를 받음 */
      this.socket.on("addNewPlayer", (socketId) => {
          console.log("MG-05 addNewPlayer");
          /* 전달 받은 player의 비디오 UI 수정 socketId는 newPlayer의 this.socket.id */
          this.addCharacterInfoInGame(socketId)
      });
      /* MG-07. 마피아 게임 플레이어 목록을 받아서 게임 화면에 플레이어 비디오를 보여준다*/
      /* (내가 나중에 입장) 기존에 존재하던 유저들의 정보를 받음 */
      this.socket.on("sendCurrentPlayers", (players) => {
          console.log("MG-07 sendCurrentPlayers", players);
          /* 전달 받은 player의 비디오 UI 수정, players는 socketId가 들어있는 배열 */
          for(let socketId of players) {
            this.addCharacterInfoInGame(socketId)
          }
      });
      /* MG-10. 마피아 게임을 위한 정보를 수신하고 투표 시작 */
      this.socket.on("sendRole", (role) => {
          console.log("MG-10 sendRole", role);
          // 자기 역할 저장 및 직업 확인 팝업
          // 회의 시작
          this.setState({amIAlive: true, isMafiaGameStarted: true, myRole: role}); // 게임 시작 시, 내 상태를 '생존'으로 바꾼다.
          // 순서 조심
          
          console.log('role from server', role);
          console.log('this.myRoleRef.current',this.myRoleRef.current);
          this.myRoleRef.current.textContent = role;
      });
      /* MG-15. 생사 투표 진행 */
      this.socket.on("sendVoteResult", (deadPlayerSocketId) => {
          console.log("MG-15 sendVoteResult", deadPlayerSocketId);
          /* TODO: 생사 투표 진행 */
          // 결과 전달은 sendLiveOrDie 함수를 통해
          if (deadPlayerSocketId == undefined) {
            return;
          } else {
            this.setState({liveOrDieModalOnOff: true})
          }
      });

      /* MG-18. 생사 투표 결과 확인 및 Night 턴 전환 */
      this.socket.on("confirmLiveOrDie", (results, live, die, isGameEnd) => {
          console.log("confirmLiveOrDie");
          console.log(results, live, die, isGameEnd);
          /* TODO: NightTurn 진행 할 경우 팝업 등 화면 전환 구현 */
          this.setState({liveOrDieModalOnOff: false});
          if (isGameEnd) {
            alert(`${isGameEnd}의 승리로 끝났습니다`)
          } else {
            // this.socket.emit("startNight");
          }
      });

      /* MG-20. 밤에 역할별 동작 수행 */
      this.socket.on("doNightAction", () => {
          /* 각 역할 별 화면 구성하기 */
          /* 선택 및 확정은 시민 투표와 동일 */
          // 1. 다시금 선택할 수 있도록 하기
          let myRole = this.state.myRole
          if (myRole == 'mafia' || myRole == 'police' || myRole == 'doctor') {
            document.querySelector('.sendCandidate').disabled = 'false';
            document.querySelector('.confirmCandidate').disabled = 'false';
          }
          
      });

      this.socket.on("checkMafia", (isMafia) => {
          if(this.state.myRole == "police") {
            if(isMafia) {
              alert(`선택한사람${this.state.selectedPlayerSocketId}이 마피아가 맞습니다`);
            } else {
              alert(`선택한사람${this.state.selectedPlayerSocketId}이 마피아가 아닙니다`);
            }
          } else {
            return;
          }
      })

      this.socket.on("nightOver", (isSomebodyDie, isGameEnd) => {
        if(isSomebodyDie) {
          alert("지난 밤 누군가가 죽었습니다")
        } else {
          alert("지난 밤 아무도 죽지 않았습니다")
        }

        if(isGameEnd) {
          alert("게임 끝, 마피아의 승리로 끝났습니다")
        }
      })

      this.socket.on("sendCandidateResult", (choicer, pointee) => {
          console.log("after MG-12 or 22 sendCandidateResult", choicer, pointee);
          //document.querySelector(`[data-set-socketid='${pointee}'`).parentNode
      })

      /* MG-25. 게임 종료 시 결과 화면 출력 */
      this.socket.on("gameOver", () => {
        
      });
  }

  startMafiaGame = async () => {
      /* MG-08. 마피아 게임 start 버튼 클릭할 때 실행되어 서버에 게임 시작 이벤트 전달 후 대기
       * TODO: 2명 이하 일 경우 start 할 수 없도록 처리 */
      // if (this.state.playerNumber <= 2) {
      if (!(this.state.playerNumber <= 2)) {
        alert("3인 이상이 모여야 게임을 할 수 있어요");
      } else {
        this.setState({amIAlive: true}); // 게임 시작 시, 내 상태를 '생존'으로 바꾼다.
        this.setState({isMafiaGameStarted: true})
        this.socket.emit("startMafiaGame");
      }
  }

  sendCandidate = () => {
      /* MG-11. 투표 턴에서 후보 선택 정보 전달 */
      /* MG-21. Night 턴에서 각 역할군이 지정한 후보 전달 */
      /* TODO: 비디오를 선택하면 해당 비디오의 id(socketId) 를 서버에 전달 */
      console.log('Check sendCandidate socketID',this.state.selectedPlayerSocketId);
      this.socket.emit("sendCandidate", this.state.selectedPlayerSocketId);
      // socket.emit("sendCandidate", candidateSocketId);
  }

  confirmCandidate = () => {
      /* MG-13. 투표 턴에서 후보 확정 정보 전달 */
      /* MG-23. Night 턴에서 후보 확정 정보 전달 */
      // confirmCandidate
      /* TODO: sendCandidate 불가능 하도록 처리 */
      document.querySelector('.sendCandidate').disabled = 'true';
      document.querySelector('.confirmCandidate').disabled = 'true';
      // confirm 확정을 보낸다
      this.socket.emit("confirmCandidate");
      
  }

  sendLiveOrDie = (e) => {
      /* MG-16. 생사 투표 전달 */
      // socket.emit("sendLiveOrDie", liveOrDie);
      console.log('e.target.dataset.liveOrDie', e.target.dataset.liveOrDie);
      this.socket.emit("sendLiveOrDie", e.target.dataset.liveOrDie);
      // 모달창 끄기
  }  

  componentDidMount = () => {
  
    this.state.faceList = this.props.faceList;
    window.addEventListener('keydown' ,(e)=> {
      
      if (e.code ==="KeyX"){
          let parsed = JSON.parse(localStorage.getItem('myStatus'))
          console.log('x')
          /* 게임시작 */
          if (parsed.x >= 1680 && parsed.y <= 360 && !this.state.isMafiaGameOn) { 
            
            console.log('mafiagame on');
          
            this.setState({isMafiaGameOn: true})
            this.joinMafiaGame();
          
          /* 게임종료 */
          } else if (this.state.isMafiaGameOn) {
            this.setState({isMafiaGameOn: false})
            console.log('mafiagame off');
          }
      }
    })


  }

  playerSelect = (e) => {
    // parentNode가 div이다. 
    // let beforeSelected = document.querySelector(`[data-socketid='${this.state.selectedPlayerSocketId}']`).parentNode;
    if(e.target.parentNode.tagName == 'BUTTON') { // 이미지를 클릭하게 될 경우. event bubble 다루기
      e.target = e.target.parentNode;
    }
    let beforeSelected = document.querySelectorAll(`[data-socketid]`);
    for(let i of beforeSelected) {
      i.parentNode.style.border = '1px solid grey';
    }

    // beforeSelected.style.border = '1px solid grey';
    e.target.parentNode.style.border = '2px solid orange';
    this.setState({selectedPlayerSocketId: `${e.target.dataset.socketid}`});
    // console.log(this.state.selectedPlayerSocketId);
  }

  render() {
    let mainMafiaComponent;
    let mafiaGameFrameStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      width: '80vw',
      height: '75vh',
      position: 'fixed',
      bottom: '0px',
      backgroundColor: 'Beige',
      zIndex: '10',
    }
    let playerContainerStyle = {
      width: '39vw',
      height: '14vh',
      border: '1px solid grey',
      margin: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }
    let buttonStyle = {
      fontFamily: 'Gaegu',
      fontSize: '1.5rem',
      padding: '0rem 0.5rem',
      borderRadius: '5%',
      backgroundColor: 'goldenrod',
      margin: '0.5rem',
    }

    let playerButtonStyle = {
      fontFamily: 'Gaegu',
      fontSize: '1.2rem',
      // padding: '0rem 0.5rem',
      borderRadius: '15%',
      // backgroundColor: 'peru',
      margin: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }

    let liveOrDieModalStyle = {
      // position: 'fixed',
      position: 'absolute',
      fontSize: '1.5rem',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      border: '2px solid peru',
      width: '50vw',
      height: '20vh',
      backgroundColor: 'goldenrod',
      display: 'flex',
      justifyContent: 'center',
    }

    let liveOrDieVoteBoxStyle = {
      width: '100%',
    }

    let liveOrDieModal = <div className='liveOrDieModal' style={liveOrDieModalStyle}>
      <div className='live-or-die-vote-box' style={liveOrDieVoteBoxStyle}>
        <button style={{fontSize: '2rem'}} onClick={this.sendLiveOrDie} data-live-or-die='live' > 👍 </button>시민  
      </div>
      <div className='live-or-die-vote-box' style={liveOrDieVoteBoxStyle}>
        <button style={{fontSize: '2rem'}} onClick={this.sendLiveOrDie} data-live-or-die='die' > 👎 </button>마피아 
      </div>
    </div>

    if (this.state.isMafiaGameOn) {
      mainMafiaComponent =  <div className='mafiaGameFrame' style={mafiaGameFrameStyle}>
          {/* {this.state.liveOrDieModal ? liveOrDieModal : <div></div> } */}
          {liveOrDieModal}
          {/* <div className="players-wrapper" style={{width: '100%'}}> */}
              <div className='player-container' style={playerContainerStyle}>
                  <button className='player-button' data-player-number='1' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                 <button className='player-button' data-player-number='2' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                  <button className='player-button' data-player-number='3' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                 <button className='player-button' data-player-number='4' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                 <button className='player-button' data-player-number='5' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                 <button className='player-button' data-player-number='6' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                 <button className='player-button' data-player-number='7' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                 <button className='player-button' data-player-number='8' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                  <button className='player-button' data-player-number='9' data-socketid="" onClick={this.playerSelect} style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                  {this.state.isMafiaGameStarted
                    ? <div>
                        <button style={buttonStyle} className='sendCandidate' onClick={this.sendCandidate}> 선택 </button>
                        <button style={buttonStyle} className='confirmCandidate' onClick={this.confirmCandidate}> 확정 </button> 
                        <span>My Role:<span className="myRole" ref={this.myRoleRef}></span></span>
                      </div>
                    : <button style={buttonStyle} className='startMafiaGame' onClick={this.startMafiaGame}> 게임 시작 </button>}
              </div>
          </div>          
        // </div>
    } else {
      mainMafiaComponent = <div className='mafiaGameFrame'> </div>
    }


    return (
      <div>
        {mainMafiaComponent}
      </div>
    );
  }
}

export default mafiaGame;