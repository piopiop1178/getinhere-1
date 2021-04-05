import React, { useEffect, useRef, useState } from 'react';
import {LoadingPage2} from '../presetPage';

const IframeGame = ({gameNumber, runGame1, runGame2, runGame3, runGame4, runGame5, runGame6}) => {
    const [loadingdone, setLoadingdone] = useState(false);
    useEffect(()=>{
        console.log(loadingdone)
    })
    
    const inviteCodeButton = () => {
        document.querySelector('#iframe-game').src = document.querySelector('.invite-code-input').value;
        document.querySelector('.invite-code-input').value = "";
      }

    let iFrameGameMain;
    if (gameNumber === 0){
        if (loadingdone === true) setLoadingdone(false);
        iFrameGameMain =
            <div onLoad={()=> setLoadingdone(true)} className='select-game-container'>
                <button className='select-game-button' onClick={()=>runGame1()}>캐치마인드</button>
                <button className='select-game-button' onClick={()=>runGame2()}>공 튕기기</button>
                <button className='select-game-button' onClick={()=>runGame3()}>뱀 키우기</button>
                <button className='select-game-button' onClick={()=>runGame4()}>땅따먹기</button>
                <button className='select-game-button' onClick={()=>runGame5()}>팀 전투게임</button>
                <button className='select-game-button' onClick={()=>runGame6()}>배틀그라운드</button>
            </div>
    }   
    else if (gameNumber === 1){
        iFrameGameMain = 
        <>
            <div className="invite-code-wrapper">
                <input type="text" className="invite-code-input" placeholder="   초대 코드를 입력해주세요  Input your Invite Code"/> 
                <button className="invite-code-button" onClick={inviteCodeButton}> JOIN </button>
                <span className="iframe-game-guide"> 초대 코드 입력 후 Play 버튼을 눌러주세요! </span>
            </div>
            <iframe onLoad={()=> setLoadingdone(true)} id='iframe-game' src="https://skribbl.io" ></iframe> 
        </>
    }
    else if (gameNumber === 2){
        iFrameGameMain = <iframe onLoad={()=> setLoadingdone(true)} id='iframe-game' src="https://bonk.io" ></iframe> 
    }
    else if (gameNumber === 3){
        iFrameGameMain = <iframe onLoad={()=> setLoadingdone(true)} id='iframe-game' src="https://powerline.io" ></iframe> 
    }
    else if (gameNumber === 4){
        iFrameGameMain = <iframe onLoad={()=> setLoadingdone(true)} id='iframe-game' src="https://splix.io" ></iframe> 
    }
    else if (gameNumber === 5){
        iFrameGameMain = <iframe onLoad={()=> setLoadingdone(true)} id='iframe-game' src="https://battledudes.io" ></iframe> 
    }
    else if (gameNumber === 6){
        iFrameGameMain = <iframe onLoad={()=> setLoadingdone(true)} id='iframe-game' src="https://warbrokers.io" ></iframe> 
    }

    let loadingPage;
    if (!loadingdone && gameNumber){
        loadingPage = <LoadingPage2/>
    } else {
        loadingPage = <></>
    }

    return (
        <>
            {loadingPage}
            {iFrameGameMain}
        </>
    )
}


export default IframeGame;