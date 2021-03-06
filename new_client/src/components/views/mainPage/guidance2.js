import React, {useState} from 'react';

const Guidance2 = (props) =>{
    const [number, setNumber] = useState(0);

    const guidanceComments = [
        "πΊ λ§΅μ β  μ’μΈ‘ μλ¨ Gameλ°©, β‘ μ€μ μλ¨ Youtubeλ°©, β’ μ°μΈ‘ μλ¨ MAFIAλ°©, β£ μ’μΈ‘ νλ¨ νμ₯μ€μ κ° κ³΅κ° λ³ κΈ°λ₯μ΄ κ΅¬νλμ΄ μκ³   β€ λλ¨Έμ§ κ³΅κ°μ λ‘λΉ κ³΅κ°μΌλ‘ μ¬μ©ν©λλ€.",
        "π κ°μ κ³΅κ°μ μλ μ¬μ©μλ νλ©΄ μ€μ μλ¨μ μΉ΄λ©λΌκ° λνλκ³  μμ λνκ° κ°λ₯ν©λλ€.",
        "πΉ Gameλ°©μμ ν€λ³΄λ [X]λ²νΌμ λλ₯΄λ©΄ μ¬λ¬ μΉκ²μμ ν  μ μμ΅λλ€.",
        "π Youtubeλ°©μ ν€λ³΄λ [X]λ²νΌμ λλ₯΄λ©΄ Youtubeλ₯Ό ν¨κ» λ³Ό μ μμ΅λλ€.",
        "-βμΉκ΅¬λ€μ΄λ κ°μ΄ λ³΄κΈ°βλ₯Ό ν΄λ¦­νλ©΄ Youtubeλ°©μ μλ μΉκ΅¬λ€ μ€μμ νμ¬ μμμ λ³΄κ³  μμ§ μμ μΉκ΅¬λ€κ³Ό ν¨κ» λ³Ό μ μμ΅λλ€.",
        "π΅π»β MAFIAλ°©μμ ν€λ³΄λ [X]λ²νΌμ λλ₯΄λ©΄ MAFIA κ²μμ μ§νν  μ μμ΅λλ€.",
        "π» λ‘λΉ κ³΅κ°μμ ν€λ³΄λ [X]λ²νΌμ λλ¬μ Youtube μμμ ν¨κ» λ€μ μ μμ΅λλ€.",
        "-βμΉκ΅¬λ€μ΄λ κ°μ΄ λ£κΈ°βλ₯Ό ν΄λ¦­νλ©΄ λ©μΈλ°©μ μλ μΉκ΅¬λ€ μ€μμ νμ¬ μμμ λ£κ³  μμ§ μμ μΉκ΅¬λ€κ³Ό ν¨κ» λ€μ μ μμ΅λλ€.",
        "π½ νμ₯μ€μμλ λ€λ₯Έ μ¬μ©μμ μ°κ²°μ λμ΅λλ€. μλ¦¬λ₯Ό λΉμΈ λλ νμ₯μ€μ λ€μ΄κ°λ©΄ λ©λλ€.",
        "π¬ μ°μΈ‘μ μ±νμ°½μμ λ°μ‘ν λ©μμ§λ μ μ²΄ μ¬μ©μμκ² μ λ¬λ©λλ€.",
        "πΊ μ°μΈ‘ νλ¨μμ λ³ΈμΈμ μΉ΄λ©λΌλ₯Ό νμΈ ν  μ μκ³  λ²νΌμ ν΅ν΄ λͺ κ°μ§ κΈ°λ₯μ μ¬μ©ν  μ μμ΅λλ€",
        "π¨βπ©βπ¦ [Invite] λ²νΌμ ν΄λ¦­νλ©΄ μ΄λ λ§ν¬κ° λ³΅μ¬λ©λλ€. λ§ν¬λ₯Ό κ³΅μ νμ¬ λ€λ₯Έ μ¬λμ νμ¬ λ°©μΌλ‘ μ΄λν  μ μμ΅λλ€.",
        "π» [π»] λ²νΌμ ν΄λ¦­νλ©΄ νλ©΄μ κ³΅μ ν  μ μμ΅λλ€. νλ©΄ κ³΅μ  κΈ°λ₯μ μ¬μ©νκ³  μλ λ€λ₯Έ μ¬μ©μμ λΉλμ€λ₯Ό λλΈ ν΄λ¦­νλ©΄ νλ©΄μ νλν΄μ λ³Ό μ μμ΅λλ€.",
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
                <div className="guidance-left"><span className="pointer" onClick={goLeft}>π</span></div>
                <div className="guidance-right"><span className="pointer" onClick={goRight}>π</span></div>
                <div className="guidance-close"><span className="pointer" onClick={props.guidanceOnOff}>β</span></div>
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