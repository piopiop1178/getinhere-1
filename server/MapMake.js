require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, 
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

// //! mongoose 사용할 스키마 (추후 보완 필요)
// const MapSchema = new mongoose.Schema({
//     MAP_NUMBER: {type: Number, required: true, unique: true},
//     TILE_LENGTH: {type: Number, required: true, min:1},
//     TILE_WIDTH: {type: Number, required: true, min:1},
//     TILE_HEIGHT: {type: Number, required: true, min:1},
//     TILE_CHAR_SIZE: {type: Number, required: true, min:1},
//     BACKGROUND_IMG: {type: String, default: '#FFFFFF'}, // filesystem상의 이미지 경로
//     BLOCKED_AREA: [Number], // 막힌구역 DB 형태
//   });

// //! mongoose에 데이터 넣는 코드
//   let MapInfo = mongoose.model('MapInfo', MapSchema); //  mongoose.model의 첫번째 인자인 MapInfo의 소문자 형태로 collection 이름이 결정됨
//   let mapinfoss = new MapInfo({
//     MAP_NUMBER : 2,
//     TILE_LENGTH : 60,
//     TILE_WIDTH : 40,
//     TILE_HEIGHT : 20,
//     TILE_CHAR_SIZE : 60,
//     BACKGROUND_IMG : "#FFFFAA",
//     BLOCKED_AREA : [32, 44, 260, 380, 302, 182, 220, 182, 322, 202, 102, 110, 162, 228, 95, 187, 256, 174],
//   })
  
//   mapinfoss.save((err) => {
//     if(err) {
//       console.log("can't save");
//       return
//     } else {
//       console.log("save Success")
//     }
//   })
// //! 데이터 꺼내오는 코드
// let MapInfo = mongoose.model('MapInfo', MapSchema)
// MapInfo.find({'BACKGROUND_IMG': '#FFFFFF'}).exec((err, map) => {
//     console.log(map)
// })