'use strict';

require('dotenv').config()
const mongoose = require('mongoose')



mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

const MapInfo = require('./MapInfo');
const BlockInfo = require('./BlockInfo');
const MusicInfo = require('./MusicInfo');

const MapInfoList = [];
const BlockInfoList = [];
const MusicInfoList = [];

/* 저장할 데이터 생성 */

/* -------------------------------------------- */
// const mapInfo00 = new MapInfo({
//   NUMBER: 0,
//   TILE_LENGTH: 60,
//   TILE_WIDTH: 40,
//   TILE_HEIGHT: 20,
//   BACKGROUND_IMG_PATH: "/maps/map1.png",
// });
// MapInfoList.push(mapInfo00);

// const blockInfo00 = new BlockInfo({
//   NUMBER: 0,
//   POSITION_LIST: [9, 11, 20, 25, 31, 50, 100, 150, 170, 350, 380, 388, 500, 512, 513, 514, 550, 600, 650, 670, 677, 680],
// });
// BlockInfoList.push(blockInfo00);

// const musicInfo00 = new MusicInfo({
//   NUMBER: 0,
//   POSITION_LIST: [761],
//   SOURCE_LIST: ["../music/all_falls_down.mp3"],
//   IMAGE_LIST: ["/images/1.jpg"],
// });
// MusicInfoList.push(musicInfo00);

const mapInfo00 = new MapInfo({
  NUMBER: 0,
  TILE_LENGTH: 60,
  TILE_WIDTH: 40,
  TILE_HEIGHT: 20,
  BACKGROUND_IMG_PATH: "/maps/map4.jpg",
});
MapInfoList.push(mapInfo00);

const blockInfo00 = new BlockInfo({
  NUMBER: 0,
  POSITION_LIST : ["15", "28", "55", "68", "95", "108", "135", "148", "175", "188", "215", "228", "255", "268", 
  "281", "282", "283", "292", "293", "294", "295", "296", "297", "306", "307", "308", "309", "310", "319", "320",
  "415", "455", "426", "427", "466", "467", "537", "538", "539", "540", "541", "542", "543", "577", "578", "579",
  "580", "581", "582", "583", "617", "618", "619", "620", "621", "622", "623", ],
});
BlockInfoList.push(blockInfo00);

const musicInfo00 = new MusicInfo({
  NUMBER: 0,
  POSITION_LIST: [761],
  SOURCE_LIST: ["../music/all_falls_down.mp3"],
  IMAGE_LIST: ["/images/1.jpg"],
});
MusicInfoList.push(musicInfo00);

const mapInfo01 = new MapInfo({
  NUMBER: 1,
  TILE_LENGTH: 60,
  TILE_WIDTH: 40,
  TILE_HEIGHT: 20,
  BACKGROUND_IMG_PATH: "/maps/map4.jpg",
});
MapInfoList.push(mapInfo01);

const blockInfo01 = new BlockInfo({
  NUMBER: 1,
  POSITION_LIST : ["15", "28", "55", "68", "95", "108", "135", "148", "175", "188", "215", "228", "255", "268", 
  "281", "282", "283", "292", "293", "294", "295", "296", "297", "306", "307", "308", "309", "310", "319", "320",
  "415", "455", "426", "427", "466", "467", "537", "538", "539", "540", "541", "542", "543", "577", "578", "579",
  "580", "581", "582", "583", "617", "618", "619", "620", "621", "622", "623", ],
});
BlockInfoList.push(blockInfo01);

const musicInfo01 = new MusicInfo({
  NUMBER: 1,
  POSITION_LIST: [761],
  SOURCE_LIST: ["../music/all_falls_down.mp3"],
  IMAGE_LIST: ["/images/1.jpg"],
});
MusicInfoList.push(musicInfo01);

const mapInfo02 = new MapInfo({
  NUMBER: 2,
  TILE_LENGTH: 60,
  TILE_WIDTH: 40,
  TILE_HEIGHT: 20,
  BACKGROUND_IMG_PATH: "/maps/map4.jpg",
});
MapInfoList.push(mapInfo02);

const blockInfo02 = new BlockInfo({
  NUMBER: 2,
  POSITION_LIST : ["15", "28", "55", "68", "95", "108", "135", "148", "175", "188", "215", "228", "255", "268", 
  "281", "282", "283", "292", "293", "294", "295", "296", "297", "306", "307", "308", "309", "310", "319", "320",
  "415", "455", "426", "427", "466", "467", "537", "538", "539", "540", "541", "542", "543", "577", "578", "579",
  "580", "581", "582", "583", "617", "618", "619", "620", "621", "622", "623", ],
});
BlockInfoList.push(blockInfo02);

const musicInfo02 = new MusicInfo({
  NUMBER: 2,
  POSITION_LIST: [761],
  SOURCE_LIST: ["../music/all_falls_down.mp3"],
  IMAGE_LIST: ["/images/1.jpg"],
});
MusicInfoList.push(musicInfo02);



// const mapInfo04 = new MapInfo({
//     NUMBER: 4,
//     TILE_LENGTH: 60,
//     TILE_WIDTH: 40,
//     TILE_HEIGHT: 20,
//     BACKGROUND_IMG_PATH: "/maps/map4.jpg",
//   });
//   MapInfoList.push(mapInfo04);
  
//   const blockInfo04 = new BlockInfo({
//     NUMBER: 4,
//     POSITION_LIST : ["15", "28", "55", "68", "95", "108", "135", "148", "175", "188", "215", "228", "255", "268", 
//     "281", "282", "283", "292", "293", "294", "295", "296", "297", "306", "307", "308", "309", "310", "319", "320",
//     "415", "455", "426", "427", "466", "467", "537", "538", "539", "540", "541", "542", "543", "577", "578", "579",
//     "580", "581", "582", "583", "617", "618", "619", "620", "621", "622", "623", ],
//   });
//   BlockInfoList.push(blockInfo04);
  
//   const musicInfo04 = new MusicInfo({
//     NUMBER: 4,
//     POSITION_LIST: [761],
//     SOURCE_LIST: ["../music/all_falls_down.mp3"],
//     IMAGE_LIST: ["/images/1.jpg"],
//   });
//   MusicInfoList.push(musicInfo04);


/* 그동안 생성한 데이터를 한번에 저장 */

for (let i = 0; i < MapInfoList.length; i++) {
  MapInfoList[i].save((err) => {
    if (err) {
      console.log(`save MapInfoList[${i}] : ERROR`);
      console.log(err);
      return
    } else {
      console.log(`save MapInfoList[${i}] : SUCCESS`);
    }
  });
}

for (let i = 0; i < BlockInfoList.length; i++) {
  BlockInfoList[i].save((err) => {
    if (err) {
      console.log(`save BlokcInfoList[${i}] : ERROR`);
      console.log(err);
      return
    } else {
      console.log(`save BlockInfoList[${i}] : SUCCESS`);
    }
  })
}

for (let i = 0; i < MusicInfoList.length; i++) {
  MusicInfoList[i].save((err) => {
    if (err) {
      console.log(`save MusicInfoList[${i}] : ERROR`);
      console.log(err);
      return
    } else {
      console.log(`save MusicInfoList[${i}] : SUCCESS`);
    }
  })
}

