import React, {useState} from 'react';

const Guidance2 = (props) =>{
    const [number, setNumber] = useState(0);

    const guidanceComments = [
        "🗺 맵은 ① 좌측 상단 Game방, ② 중앙 상단 Youtube방, ③ 우측 상단 MAFIA방, ④ 좌측 하단 화장실에 각 공간 별 기능이 구현되어 있고  ⑤ 나머지 공간은 로비 공간으로 사용합니다.",
        "📞 화면 중앙 상단에는 같은 공간에 있는 사용자들의 카메라가 나타나고 영상 대화가 가능합니다.",
        "🕹 Game방에서 키보드 [X]버튼을 누르면 여러 웹게임을 할 수 있습니다.",
        "🎞 Youtube방에 키보드 [X]버튼을 누르면 Youtube를 함께 볼 수 있습니다.",
        "-“친구들이랑 같이 보기”를 클릭하면 Youtube방에 있는 친구들 중에서 현재 영상을 보고 있지 않은 친구들과 함께 볼 수 있습니다.",
        "🕵🏻‍ MAFIA방에서 키보드 [X]버튼을 누르면 MAFIA 게임을 진행할 수 있습니다.",
        "📻 로비 공간에서 키보드 [X]버튼을 눌러서 Youtube 음악을 함께 들을 수 있습니다.",
        "-“친구들이랑 같이 듣기”를 클릭하면 메인방에 있는 친구들 중에서 현재 음악을 듣고 있지 않은 친구들과 함께 들을 수 있습니다.",
        "🚽 화장실에서는 다른 사용자와 연결을 끊습니다. 자리를 비울 때는 화장실에 들어가면 됩니다.",
        "💬 우측의 채팅창에서 발송한 메시지는 전체 사용자에게 전달됩니다.",
        "📺 우측 하단에서 본인의 카메라를 확인 할 수 있고 버튼을 통해 몇 가지 기능을 사용할 수 있습니다",
        "👨‍👩‍👦 [Invite] 버튼을 클릭하면 초대 링크가 복사됩니다. 링크를 공유하여 다른 사람을 현재 방으로 초대할 수 있습니다.",
        "💻 [💻] 버튼을 클릭하면 화면을 공유할 수 있습니다. 화면 공유 기능을 사용하고 있는 다른 사용자의 비디오를 더블 클릭하면 화면을 확대해서 볼 수 있습니다.",
    ];

    const guidanceImages = [
        "/images/guidance/1.png",
        "/images/guidance/2.png",
        "/images/guidance/3.png",
        "/images/guidance/4.png",
        "/images/guidance/5.png",
        "/images/guidance/6.png",
        "/images/guidance/7.png",
        "/images/guidance/8.png",
        "/images/guidance/9.png",
        "/images/guidance/10.png",
        "/images/guidance/11.png",
        "/images/guidance/12.png",
        "/images/guidance/13.png",
    ];

    const goLeft = () => {
        if(number == 0){
            return;
        }
        setNumber(number - 1);
    }

    const goRight = () => {
        if(number == guidanceComments.length-1){
            return;
        }
        setNumber(number + 1);
    }

    return (
        <div className="guidance">
            <div className="guidance-box">
                <div className="guidance-left"><span className="pointer" onClick={goLeft}>👈</span></div>
                <div className="guidance-right"><span className="pointer" onClick={goRight}>👉</span></div>
                <div className="guidance-close"><span className="pointer" onClick={props.guidanceOnOff}>❌</span></div>
                <div className="guidance-img-box">
                    <img className="guidance-img" src={guidanceImages[number]} alt="temp"/>
                </div>
                <div className="guidance-comment"> 
                    {guidanceComments[number]}
                </div>
            </div>
        </div>
    );
} 
export default Guidance2;