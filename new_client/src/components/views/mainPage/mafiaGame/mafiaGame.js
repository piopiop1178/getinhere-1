import React, { Component } from 'react';
let swal = window.swal;


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
    // liveOrDieModalOnOff: true, //! 일단 켜놓자
    myRole: '',
    alreadySendJoinMafiaGame: false,
    candidate: '',
    confirmClicked: false,
    isDay: true,
  }
  socket = this.props.socket;

  sendCandidateButton = document.querySelector('.sendCandidate');
  confirmCandidateButton = document.querySelector('.confirmCandidate');

  myRoleRef = React.createRef();
  playerButtonRef = React.createRef();
  nightToDayColor = () => document.querySelector('.mafiaGameFrame').style.backgroundColor = 'Beige';
  dayToNightColor = () => document.querySelector('.mafiaGameFrame').style.backgroundColor = 'DarkSlateBlue';
  //style
  playerContainerBorderStyle = '1px solid peru'
  playerChoiceSpanStyle = "color:black;font-weight:bold; margin: 2px; padding: 2px; margin:2px; border-radius: 5px; "
  confirmChoiceSpanStyle = "color:green;font-weight:bold; border: 2px solid green; border-radius: 5px; padding: 2px; margin: 2px; background-color:white;"
  mafiaPlayerImageSize = '70px';
  selectedPlayerBorderStyle = '3px solid red'
  engToKorRoles = {
    "citizen": "시민",
    "mafia": "마피아",
    "police": "경찰관",
    "doctor": "의사", 
  }
  
  
  returnRoleExplanationByPlayerNumber = (playerNum) => {
    switch(playerNum) {
      case 2:
        return '구성) 시민 1명, 마피아 1명';
      case 3:
        return "구성) 시민 2명, 마피아 1명"
      case 4:
        return "구성) 시민 2명, 마피아 1명, 경찰 1명"
      case 5:
        return "구성) 시민 3명, 마피아 1명, 경찰 1명"
      case 6:
        return "구성) 시민 2명, 마피아 2명, 경찰 1명, 의사 1명"
      case 7:
        return "구성) 시민 3명, 마피아 2명, 경찰 1명, 의사 1명"
      case 8:
        return "구성) 시민 4명, 마피아 2명, 경찰 1명, 의사 1명"
      case 9:
        return "구성) 시민 5명, 마피아 3명, 경찰 1명, 의사 1명"
    }
  }


  addCharacterInfoInGame = (socketId) => {
      let newPlayer = document.querySelector(`[data-player-number='${this.state.playerNumber+1}']`);

      if(newPlayer) {
          newPlayer.setAttribute("data-set-socketid", socketId);
          newPlayer.dataset.socketid = socketId ? socketId : '00' ;
          this.state.playerNumber += 1;

          let playerImage = document.createElement('img');
          let playerNickName = document.createElement('span');
          let characterNumber;

          if (this.state.faceList[socketId] != undefined) {
            playerImage.src = this.state.faceList[socketId].src;
          } else {
            characterNumber = this.props.characterNumberBySocketid[socketId]
            characterNumber = characterNumber ? characterNumber : 0;  // 반창고, 숫자 0을 못받아온다
            characterNumber && (playerImage.src = this.props.characterList[characterNumber].src);
          }
          playerImage.style.width = this.mafiaPlayerImageSize;
          playerImage.style.height = this.mafiaPlayerImageSize;
          playerNickName.innerText = this.props.nicknameBySocketid[socketId];
          newPlayer.appendChild(playerImage);
          newPlayer.appendChild(playerNickName);
        
          console.log('thispropscharacterList', this.props.characterList);
      }
  }

  leaveGame = () => {
    this.setState({
        isMafiaGameOn: false,
        isMafiaGameStarted: false,
        selectedPlayerSocketId: '',
        playerNumber: 0,
        deadPlayers: [],
        liveOrDieModalOnOff: false,
        myRole: '',
        alreadySendJoinMafiaGame: false,
    })
    this.socket.emit('leavePlayer');
    // 소켓을 다 닫아주어야한다.
    }



  removePlayersChoices = () => {
    // * main 화면 깨끝하게 비워주기
    let myChoiceElement = document.getElementById(`${this.socket.id}-vote`);
    myChoiceElement && myChoiceElement.remove(); // * 내가 선택한거 지워주기
    for(let player of Object.keys(this.props.characterNumberBySocketid) ) {
      let beforeChoicerSpan = document.getElementById(`${player}-vote`);
      beforeChoicerSpan && beforeChoicerSpan.remove();
    }
  }

  dieFilter = (diePlayerSocketId) => {
    //* 죽은사람 화면에 표시해주기(greyscale, blur 효과), 해당사람 선택 못하도록 하기
    let diePlayerButton  = document.querySelector(`[data-set-socketid='${diePlayerSocketId}'`); // * 소켓아이디로 찾은 button의 첫번째자식: 이미지
    if(diePlayerButton) {
        diePlayerButton.firstElementChild.style.filter = 'grayscale(80%) blur(5px)'
        diePlayerButton.disabled = true;
    }
  }

  joinMafiaGame = async () => {
    /* MG-01. 마피아 게임 창을 띄운다 */
    /* MG-02. 마피아 게임을 위한 socket 세팅을 완료하고 게임 참여를 알린다 */
    this.socket.emit("joinMafiaGame", (response) => {
      if(response.status === true){
        document.querySelector(`.startMafiaGame`) && (document.querySelector(`.startMafiaGame`).disabled = true);
      }
    });   // 게임 참여 알림
  }

  initMafiaGame = async () =>{
      this.socket.on("showMafia", (mafiasId) => {
        let mafiaString = '';
        for(let mafiaId of mafiasId) {
          mafiaString += `  ${this.props.nicknameBySocketid[mafiaId]}`;
        }
        if (mafiasId.length == 1) {
          return
        } else {
          swal('쉿! 마피아명단', `${mafiaString}`);
        }
      })

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
          swal(`${this.engToKorRoles[role]}`, `당신은 ${this.engToKorRoles[role]}입니다. \n ${this.returnRoleExplanationByPlayerNumber(this.state.playerNumber)}`)
          // 회의 시작
          this.setState({amIAlive: true, isMafiaGameStarted: true, myRole: role}); // 게임 시작 시, 내 상태를 '생존'으로 바꾼다.
          // 순서 조심
          
          this.myRoleRef.current.textContent = this.engToKorRoles[role];
          document.querySelector('.confirmCandidate') && (document.querySelector('.confirmCandidate').disabled = true);

      });
      /* MG-15. 생사 투표 진행 */ //최후변론 최종변론
      this.socket.on("sendVoteResult", (candidate) => {
          console.log("MG-15 sendVoteResult", candidate);
          /* TODO: 생사 투표 진행 */
          // 결과 전달은 sendLiveOrDie 함수를 통해
          if (candidate == undefined) {
            // alert("낮에 아무도 죽지 않았습니다!");
            swal("낮에 아무도 죽지 않았습니다!", "");
            return;
          } else {
            this.setState({liveOrDieModalOnOff: true}) // 생사투표모달 켜기
            if(this.state.amIAlive == false) { // 내가 죽어있으면, 선택 못하도록 하기
              document.querySelector(`[data-live-or-die='live']`) && (document.querySelector(`[data-live-or-die='live']`).disabled = true);
              document.querySelector(`[data-live-or-die='die']`) && (document.querySelector(`[data-live-or-die='die']`).disabled = true);
            } else { // * 살아 있을 때만 투표가능하다
              document.querySelector(`[data-live-or-die='live']`) && (document.querySelector(`[data-live-or-die='live']`).disabled = false);
              document.querySelector(`[data-live-or-die='die']`) && (document.querySelector(`[data-live-or-die='die']`).disabled = false);
            }
            // * 후보자가 존재하면, 후보자 사진과 이름을 모달창 가운데에 띄운다
            let characterNumber;
            let candidateImage = document.querySelector('.liveOrDieModalCandidateImage');
            let candidateName =  document.querySelector('.liveOrDieModalCandidateName');
            // * 후보자 비디오 위치 옮겨버리기
            this.state.candidate = candidate;
            let candidateVideo = document.getElementById(this.state.candidate);
            candidateVideo && candidateVideo.setAttribute("style", "position: fixed; left: 40%; top: 40%; transform: translate(-50%, -50%);")

            if (this.state.faceList[candidate] != undefined) {
              candidateImage.src = this.state.faceList[candidate].src;
            } else {
              characterNumber = this.props.characterNumberBySocketid[candidate]
              characterNumber = characterNumber ? characterNumber : 0;  // 반창고, 숫자 0을 못받아온다
              characterNumber && (candidateImage.src = this.props.characterList[characterNumber].src);
            }
            // candidateName && (candidateName.innerText = this.props.nicknameBySocketid[candidate]);
            candidateName && (candidateName.innerText = `${this.props.nicknameBySocketid[candidate]} 최후변론`);
          }
      });

      /* MG-18. 생사 투표 결과 확인 및 Night 턴 전환 */
      this.socket.on("confirmLiveOrDie", (results, isSomebodyDieSocketId,  live, die, isGameEnd) => {
          console.log("confirmLiveOrDie");
          //*죽은사람리스트추가
          results == 'die' && isSomebodyDieSocketId && (this.state.deadPlayers.push(isSomebodyDieSocketId))

          this.removePlayersChoices() //화면 청소
          // *영상 원위치 및 candidate 없애기
          let candidateVideo = document.getElementById(this.state.candidate);
          candidateVideo && candidateVideo.setAttribute("style", "");
          this.state.candidate = '';


          //* 내가 죽었으면, 설정해주기
          if(isSomebodyDieSocketId == this.socket.id && results == 'die') {
            this.state.amIAlive = false;
            this.setState({amIAlive: false})
            document.querySelector(`[data-live-or-die='live']`) && (document.querySelector(`[data-live-or-die='live']`).disabled = true);
            document.querySelector(`[data-live-or-die='die']`) && (document.querySelector(`[data-live-or-die='die']`).disabled  = true);
          }
          //* 투표 결과 알려주기
          if(results =='die') {
            swal(`투표 결과 ${this.props.nicknameBySocketid[isSomebodyDieSocketId]} (이)가 죽었습니다`,"잠시 후 밤이 됩니다.")
          } else if (results == 'live') {
            swal(`투표 결과 ${this.props.nicknameBySocketid[isSomebodyDieSocketId]} (이)가 살았습니다`,"잠시 후 밤이 됩니다.")
          }

          //* 죽은사람 화면에 표시해주기(greyscale, blur 효과)
          if(results == 'die')  this.dieFilter(isSomebodyDieSocketId);

          let liveVoteBox = document.querySelector(`.liveOrDieVoter-live`) 
          let dieVoteBox  = document.querySelector(`.liveOrDieVoter-die`)
          
          for(let liveVote of live) {
              let voteSpan = document.createElement('span');
              voteSpan.id = `${liveVote}-liveOrDie`
              voteSpan.innerText = this.props.nicknameBySocketid[liveVote];
              voteSpan.setAttribute('style', this.playerChoiceSpanStyle);
              liveVoteBox.appendChild(voteSpan);
          }

          for(let dieVote of die) {
              let voteSpan = document.createElement('span');
              voteSpan.id = `${dieVote}-liveOrDie`
              voteSpan.innerText = this.props.nicknameBySocketid[dieVote];
              voteSpan.setAttribute('style', this.playerChoiceSpanStyle);
              dieVoteBox.appendChild(voteSpan);
          }

          /* TODO: NightTurn 진행 할 경우 팝업 등 화면 전환 구현 */
          if (isGameEnd) {
            // alert(`낮, 투표 결과: ${isGameEnd}의 승리로 끝났습니다`);
            swal(`${isGameEnd} 승리!`, `낮, 투표 결과: ${isGameEnd}의 승리로 끝났습니다`);
            this.leaveGame();
          } else {
            // * 경기가 끝나지 않았으면, 5초 후에 모달창을 닫고, 밤이 시작된다
            setTimeout(()=> {
              this.removePlayersChoices() //화면 청소
              this.setState({liveOrDieModalOnOff: false}); // 생사투표모달 끄기
            }, 6000)
            // this.socket.emit("startNight");
          }
      });

      /* MG-20. 밤에 역할별 동작 수행 */
      // 밤 시작
      this.socket.on("doNightAction", () => {
          this.state.isDay = false;
          this.state.confirmClicked = false;
           
          this.dayToNightColor(); // * 밤으로 디자인 변경
          this.removePlayersChoices() // *화면 청소
          
          // 이건 서버에서 잘 온다
          /* 각 역할 별 화면 구성하기 */
          /* 선택 및 확정은 시민 투표와 동일 */
          // 1. 다시금 선택할 수 있도록 하기
          console.log('clientDoNightAction 시작')
          let myRole = this.state.myRole
          if (myRole == 'mafia' && this.state.amIAlive) { // * 살아 있을 때만 투표가능하다) 
            // document.querySelector('.sendCandidate') && (document.querySelector('.sendCandidate').disabled = false);
            // alert('밤이 되었습니다. 당신은 마피아. 죽일 사람을 선택해주세요')
            swal("밤이 되었습니다", "당신은 마피아. 죽일 사람을 선택해주세요", "info");
          } else if (myRole == 'police' && this.state.amIAlive) {
            // document.querySelector('.sendCandidate') && (document.querySelector('.sendCandidate').disabled = false);
            // alert('밤이 되었습니다. 당신은 경찰. 마피아로 의심가는 사람을 선택해주세요')
            swal("밤이 되었습니다", "당신은 경찰. 마피아로 의심가는 사람을 선택해주세요", "info");
          } else if (myRole == 'doctor' && this.state.amIAlive) {
            // document.querySelector('.sendCandidate') && (document.querySelector('.sendCandidate').disabled = false);
            // alert('밤이 되었습니다. 당신은 의사. 살리고 싶은 사람을 선택해주세요')
            swal("밤이 되었습니다", "당신은 의사. 살리고 싶은 사람을 선택해주세요", "info");

          } else {
            // alert('밤이 되었습니다');
            swal("밤이 되었습니다", "수상한 사람을 찾아보세요", "info");
            document.querySelector('.confirmCandidate') && (document.querySelector('.confirmCandidate').disabled = true);
          }
          
      });

      this.socket.on("checkMafia", (isMafia) => {
          if(this.state.myRole == "police") {
            if(isMafia) {
              setTimeout(()=> {
                // alert(`경찰이 선택한 ${this.props.nicknameBySocketid[this.state.selectedPlayerSocketId]}(은)는 마피아가 맞습니다`);
                swal(`${this.props.nicknameBySocketid[this.state.selectedPlayerSocketId]}`, `(은)는 마피아가 맞습니다`, "success");
              }, 300)
            } else {
              setTimeout(()=> {
                // alert(`경찰이 선택한 ${this.props.nicknameBySocketid[this.state.selectedPlayerSocketId]}(은)는 마피아가 아닙니다`);
                swal(`${this.props.nicknameBySocketid[this.state.selectedPlayerSocketId]}`, `(은)는 마피아가 아닙니다`, "error");
              }, 300)
             }
          } else {
             return;
          }
      })

      //낮 시작
      this.socket.on("nightOver", (isSomebodyDieSocketId, isGameEnd) => {
        this.state.isDay = true;
        this.state.confirmClicked = false;
        this.removePlayersChoices(); // * 내 선택 지워주기
        this.nightToDayColor();
        if(isSomebodyDieSocketId) {
          this.state.deadPlayers.push(isSomebodyDieSocketId)

          // alert(`지난 밤 ${this.props.nicknameBySocketid[isSomebodyDieSocketId]}(이)가 죽었습니다`)
          swal(`${this.props.nicknameBySocketid[isSomebodyDieSocketId]}`, `(이)가 지난 밤 죽었습니다`, "error");
          //* 죽은사람 필터 씌우기
          this.dieFilter(isSomebodyDieSocketId);
          //* 내가 죽었으면, 설정해주기
          if(isSomebodyDieSocketId == this.socket.id) {
            console.log('죽었습니다');
            this.state.amIAlive = false;
            this.setState({amIAlive: false});
            document.querySelector(`[data-live-or-die='live']`) && (document.querySelector(`[data-live-or-die='live']`).disabled = true);
            document.querySelector(`[data-live-or-die='die']`)  && (document.querySelector(`[data-live-or-die='die']`).disabled  = true);
            // document.querySelector('.confirmCandidate') && (document.querySelector('.sendCandidate').disabled = true);
            // document.querySelector('.confirmCandidate') && (document.querySelector('.confirmCandidate').disabled = true);
          }
        } else {
          swal("지난 밤 아무도 죽지 않았습니다", "")
        }

        if(this.state.amIAlive) {
          document.querySelector('.sendCandidate')    && (document.querySelector('.sendCandidate').disabled = false);
          document.querySelector('.confirmCandidate') && (document.querySelector('.confirmCandidate').disabled = false);
        }

        if(isGameEnd == '시민') {
          if(this.state.myRole !== 'mafia') {
            // alert("축하합니다🤸‍♀️🤸‍♂️ 시민의 승리로 끝났습니다")
            swal("승리", "시민의 승리로 끝났습니다")
          } else {
            swal("패배", "시민의 승리로 끝났습니다")
          } 
          setTimeout(()=>{
            this.leaveGame()
          }, 3000)
        } else if (isGameEnd == '마피아') {
          if(this.state.myRole == 'mafia') {
            // alert("축하합니다🤸‍♀️🤸‍♂️ 마피아의 승리로 끝났습니다")
            swal("승리", "마피아의 승리로 끝났습니다");
          } else {
            swal("패배", "마피아의 승리로 끝났습니다");
          }
          setTimeout(()=>{
            this.leaveGame()
          }, 3000)
        }
      })

      this.socket.on("sendCandidateResult", (choicer, pointee) => { //! 서버에서 받아올 때, pointer pointee 가 제대로 안된듯. 아울러 
          console.log("after MG-12 or 22 sendCandidateResult", choicer, pointee);

          // * choicer가 기존에 선택한게 있으면, 기존 선택 지워주기
          let beforeChoicerSpan = document.getElementById(`${choicer}-vote`);
          beforeChoicerSpan && beforeChoicerSpan.remove();

          // * choicer의 span 만들어주기. 내용물은 본인의 이름
          let choicerSpan = document.createElement('span');
          choicerSpan.id = `${choicer}-vote`
          choicerSpan.innerText = this.props.nicknameBySocketid[choicer];
          choicerSpan.setAttribute('style', this.playerChoiceSpanStyle);
          
          // * 지목받은사람(pointee)의 voteBox에 appendChild 해주기
          if (document.querySelector(`[data-set-socketid='${pointee}'`)) {
            let pointeeVoteBox = document.querySelector(`[data-set-socketid='${pointee}'`).parentNode.lastElementChild;
            pointeeVoteBox.appendChild(choicerSpan);
          }
      })

      /* MG-25. 게임 종료 시 결과 화면 출력 */
      this.socket.on("gameOver", () => {
      });
      
      this.socket.on("playerClickConfirm", (socketId) => {
        console.log("playerClickConfirm");
        let choicerSpan = document.getElementById(`${socketId}-vote`);
        choicerSpan && (choicerSpan.setAttribute("style", this.confirmChoiceSpanStyle));
      });
      
      /* 게임 강제종료 by 살아있는 누군가가 게임을 나감 */
      this.socket.on("gameShutdown", ()=> {
          // alert("누군가 마피아게임을 나갔습니다. \n강제종료됩니다.");
          this.setState({
            isMafiaGameOn: false,
            isMafiaGameStarted: false,
            selectedPlayerSocketId: '',
            playerNumber: 0,
            // faceList: [],
            amIAlive: true,
            deadPlayers: [],
            liveOrDieModalOnOff: false,
            // liveOrDieModalOnOff: true, //! 일단 켜놓자
            myRole: '',
            alreadySendJoinMafiaGame: false,
            candidate: '',
            confirmClicked: false,
          })
      } )
  }

  startMafiaGame = async () => {
      /* MG-08. 마피아 게임 start 버튼 클릭할 때 실행되어 서버에 게임 시작 이벤트 전달 후 대기
       * TODO: 2명 이하 일 경우 start 할 수 없도록 처리 */
      if (this.state.playerNumber <= 2) {
        swal("3인 이상이 모여야 게임을 할 수 있어요");
      } else {
        this.setState({amIAlive: true}); // 게임 시작 시, 내 상태를 '생존'으로 바꾼다.
        this.setState({isMafiaGameStarted: true})
        this.socket.emit("startMafiaGame");
      }
 
      // this.setState({amIAlive: true}); // 게임 시작 시, 내 상태를 '생존'으로 바꾼다.
      // this.setState({isMafiaGameStarted: true})
      // this.socket.emit("startMafiaGame");
  }

  sendCandidate = () => {
      /* MG-11. 투표 턴에서 후보 선택 정보 전달 */
      /* MG-21. Night 턴에서 각 역할군이 지정한 후보 전달 */
      /* TODO: 비디오를 선택하면 해당 비디오의 id(socketId) 를 서버에 전달 */
      console.log('Check sendCandidate socketID',this.state.selectedPlayerSocketId);
      // if (this.state.selectedPlayerSocketId == false) return;
      this.socket.emit("sendCandidate", this.state.selectedPlayerSocketId);
      if(this.state.amIAlive) { // * 살아 있을 때만 투표가능하다
          document.querySelector('.confirmCandidate') && (document.querySelector('.confirmCandidate').disabled = false);
      }
  }

  confirmCandidate = () => {
      /* MG-13. 투표 턴에서 후보 확정 정보 전달 */
      /* MG-23. Night 턴에서 후보 확정 정보 전달 */
      // confirmCandidate
      /* TODO: sendCandidate 불가능 하도록 처리 */
      if (this.state.selectedPlayerSocketId == false) {alert("'사람 선택' 후 '선택' 후 '확정'해 주세요"); return;}
      document.querySelector('.sendCandidate')    &&  (document.querySelector('.sendCandidate').disabled = true);
      document.querySelector('.confirmCandidate') &&  (document.querySelector('.confirmCandidate').disabled = true);
      // confirm 확정을 보낸다
      this.socket.emit("confirmCandidate");
      this.state.confirmClicked = true;
  }

  sendLiveOrDie = (e) => {
      /* MG-16. 생사 투표 전달 */
      // socket.emit("sendLiveOrDie", liveOrDie);
      console.log('e.target.dataset.liveOrDie', e.target.dataset.liveOrDie);
      this.socket.emit("sendLiveOrDie", e.target.dataset.liveOrDie);

      document.querySelector(`[data-live-or-die='live']`) &&  (document.querySelector(`[data-live-or-die='live']`).disabled = true);
      document.querySelector(`[data-live-or-die='die']`)  &&  (document.querySelector(`[data-live-or-die='die']`).disabled  = true);
      // 모달창 끄기
  }  

  componentDidMount = async () => {
    await this.initMafiaGame(); //! 한번 처음에 그냥 소켓 만들기
    
    this.state.faceList = this.props.faceList;
    window.addEventListener('keydown' , async (e)=> {
      
      if (e.code ==="KeyX" && document.activeElement.tagName != "INPUT"){
          let parsed = JSON.parse(localStorage.getItem('myStatus'))
          /* 게임시작 */
          if (parsed.x >= 1680 && parsed.y <= 360 ) { 
            if (!this.state.isMafiaGameOn) {
                

                //* 이미 게임이 진행중이면, 리턴하기
                let isGameplay = await this.socket.request("isGamePlayed");
                if(isGameplay) {
                  swal("이미 게임이 진행중입니다"); 
                  return;
                }


                this.setState({isMafiaGameOn: true})
                this.joinMafiaGame();
            } else if (this.state.isMafiaGameOn) {
                let con = window.confirm('게임을 나가시겠습니까? (모든 참여자들 게임이 종료됨)');
                if (con == true) {
                    this.socket.emit('leavePlayer')
                    this.setState({
                        isMafiaGameOn: false,
                        isMafiaGameStarted: false,
                        selectedPlayerSocketId: '',
                        playerNumber: 0,
                        // faceList: [],
                        amIAlive: true,
                        deadPlayers: [],
                        liveOrDieModalOnOff: false,
                        // liveOrDieModalOnOff: true, //! 일단 켜놓자
                        myRole: '',
                        alreadySendJoinMafiaGame: false,
                        candidate: '',
                        confirmClicked: false,
                  })
                }
            }
          /* 게임종료 */
          }
      }
    })
  }

  playerSelect = (e) => { //playerSelection
    if(this.state.amIAlive == false) return;
    let selectedSocketId = e.currentTarget.firstElementChild.dataset.socketid;
    
    if(this.state.isDay == false && this.state.myRole == 'citizen') return; //* 밤이고 시민이면, 선택못함
    if(this.state.confirmClicked == true) return; // * confirm눌렀으면, 선택못함
    if (this.state.deadPlayers.includes(selectedSocketId)) {return;} // *이미 죽었으면, 선택 못함
    e.stopPropagation(); // 이벤트버블링 막기
    let beforeSelected = document.querySelectorAll(`[data-socketid]`);
    for(let i of beforeSelected) {
      i.parentNode.style.border = this.playerContainerBorderStyle;
    }
    
    
    // selected design
    e.currentTarget.style.border = this.selectedPlayerBorderStyle;
    this.state.selectedPlayerSocketId = selectedSocketId;
    console.log('-----------1 ', e.currentTarget.firstElementChild.dataset.socketid)
    console.log('-----------2 ', e.currentTarget.firstElementChild)
    this.sendCandidate();
    this.setState({selectedPlayerSocketId: e.currentTarget.firstElementChild.dataset.socketid});

    // selected design
    // e.target.parentNode.style.border = '4px solid red';
    // this.state.selectedPlayerSocketId = e.target.dataset.socketid;
    // this.sendCandidate();
    // this.setState({selectedPlayerSocketId: `${e.target.dataset.socketid}`});
    
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
      // zIndex: '10',
    }
    let playerContainerStyle = {
      width: '39vw',
      height: '14vh',
      // border: '1px solid peru',
      border: this.playerContainerBorderStyle,
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
      // borderRadius: '15%',
      backgroundColor: 'transparent',
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
      border: '3px solid peru',
      width: '50vw',
      height: '20vh',
      backgroundColor: 'goldenrod',
      display: 'flex',
      justifyContent: 'center',
    }

    let liveOrDieVoteBoxStyle = {
      width: '100%',
    }

    let candidateImageStyle = {
      position: 'fixed',
      // top: '40%',
      left: '50%',
      transform: 'translate(-50%, -100%)',
      width: '100px',
      height: '100px',
      border: 'none',
    }
  
    let candidateNameStyle = {
      fontFamily: 'Gaegu',
      position: 'fixed',
      display: 'block',
      top: '-10%',
      left: '50%',
      fontSize: '1rem',
      transform: 'translate(-50%, -10%)',
      borderRadius: '10%',
      backgroundColor: 'Beige',
      border: '1px solid green'
    }

    let liveOrDieVoterStyle = {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
    }

    let liveOrDieModal = 
    <div className='liveOrDieModal' style={liveOrDieModalStyle}>
        <img className='liveOrDieModalCandidateImage' style={candidateImageStyle}></img>
        <span className='liveOrDieModalCandidateName' style={candidateNameStyle}> </span>
        <div className='live-or-die-vote-box' style={liveOrDieVoteBoxStyle}>
            <button style={{fontSize: '2rem'}} onClick={this.sendLiveOrDie} data-live-or-die='live' > 👍 </button>살리자!  
            <div className='liveOrDieVoter-live' style={liveOrDieVoterStyle}></div>
        </div>
        <div className='live-or-die-vote-box' style={liveOrDieVoteBoxStyle}>
            <button style={{fontSize: '2rem'}} onClick={this.sendLiveOrDie} data-live-or-die='die' > 👎 </button>죽이자!
            <div className='liveOrDieVoter-die' style={liveOrDieVoterStyle}></div>
        </div>
    </div>

    if (this.state.isMafiaGameOn) {
      mainMafiaComponent =  <div className='mafiaGameFrame' style={mafiaGameFrameStyle}>
          {this.state.liveOrDieModalOnOff ? liveOrDieModal : <div></div> }
          {/* {liveOrDieModal} */}
          {/* <div className="players-wrapper" style={{width: '100%'}}> */}
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                  <button className='player-button' data-player-number='1' data-socketid="" style={playerButtonStyle}></button>
                  <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                 <button className='player-button' data-player-number='2' data-socketid="" style={playerButtonStyle}></button>
                 <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                  <button className='player-button' data-player-number='3' data-socketid="" style={playerButtonStyle}></button>
                  <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                 <button className='player-button' data-player-number='4' data-socketid="" style={playerButtonStyle}></button>
                 <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                 <button className='player-button' data-player-number='5' data-socketid="" style={playerButtonStyle}></button>
                 <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                 <button className='player-button' data-player-number='6' data-socketid="" style={playerButtonStyle}></button>
                 <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                 <button className='player-button' data-player-number='7' data-socketid="" style={playerButtonStyle}></button>
                 <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                 <button className='player-button' data-player-number='8' data-socketid="" style={playerButtonStyle}></button>
                 <div className="vote-box"></div>
              </div>
              <div className='player-container' style={playerContainerStyle} onClick={this.playerSelect}>
                  <button className='player-button' data-player-number='9' data-socketid="" style={playerButtonStyle}></button>
              </div>
              <div className='player-container' style={playerContainerStyle}>
                  {this.state.isMafiaGameStarted
                    ? <div>
                        {/* <button style={buttonStyle} className='sendCandidate' onClick={this.sendCandidate}>선택</button> */}
                        <button style={buttonStyle} className='confirmCandidate' onClick={this.confirmCandidate}>확정</button> 
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