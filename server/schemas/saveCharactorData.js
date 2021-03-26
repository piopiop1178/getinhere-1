'use strict';

require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

const CharacterInfo = require('./CharacterInfo');

const CharacterInfoList = [];
/* 저장할 데이터 생성 */
/* -------------------------------------------- */
const characterInfo00 = new CharacterInfo({
    NUMBER: 0,
    SOURCE_PATH: "/images/1.jpg",
});
CharacterInfoList.push(characterInfo00);

const characterInfo01 = new CharacterInfo({
    NUMBER: 1,
    SOURCE_PATH: "/images/2.png",
});
CharacterInfoList.push(characterInfo01);

const characterInfo02 = new CharacterInfo({
    NUMBER: 2,
    SOURCE_PATH: "/images/3.png",
});
CharacterInfoList.push(characterInfo02);

const characterInfo03 = new CharacterInfo({
    NUMBER: 3,
    SOURCE_PATH: "/images/4.png",
});
CharacterInfoList.push(characterInfo03);

const characterInfo04 = new CharacterInfo({
    NUMBER: 4,
    SOURCE_PATH: "/images/5.png",
});
CharacterInfoList.push(characterInfo04);

const characterInfo05 = new CharacterInfo({
    NUMBER: 5,
    SOURCE_PATH: "/images/6.png",
});
CharacterInfoList.push(characterInfo05);

const characterInfo06 = new CharacterInfo({
    NUMBER: 6,
    SOURCE_PATH: "/images/7.png",
});
CharacterInfoList.push(characterInfo06);

/* -------------------------------------------- */
// const characterInfo04 = new CharacterInfo({
//     NUMBER: 4,
//     SOURCE_PATH: "../image/char_woman2.png",
// });
// CharacterInfoList.push(characterInfo04);
/* -------------------------------------------- */


/* 그동안 생성한 데이터를 한번에 저장 */
for (let i = 0; i < CharacterInfoList.length; i++) {
    CharacterInfoList[i].save((err) => {
        if (err) {
            console.log(`save CharacterInfoList[${i}] : ERROR`);
            console.log(err);
            return
        } else {
            console.log(`save CharacterInfoList[${i}] : SUCCESS`);
        }
    });
}

