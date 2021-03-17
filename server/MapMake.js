require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, 
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

const MapSchema = new mongoose.Schema({
  TILE_LENGTH: {type: Number, required: true, min:1},
  TILE_WIDTH: {type: Number, required: true, min:1},
  TILE_HEIGHT: {type: Number, required: true, min:1},
  TILE_CHAR_SIZE: {type: Number, required: true, min:1},
  BACKGROUND_IMG: {type: String, default: '#FFFFFF'}, // filesystem상의 이미지 경로
  BLOCKED_AREA: [Number], // 막힌구역 DB 형태
});

let MapInfo = mongoose.model('MapInfo', MapSchema); // MapInfo라는 collection에 저장되나?
let mapinfo = new MapInfo({
  TILE_LENGTH : 60,
  TILE_WIDTH : 30,
  TILE_HEIGHT : 20,
  TILE_CHAR_SIZE : 60,
  BACKGROUND_IMG : "#FFFFFF",
  BLOCKED_AREA : [2, 4, 60, 480, 302, 382, 120, 382, 222, 102, 302, 110, 162, 228, 295, 87, 56, 74],
})

mapinfo.save((err) => {
  if(err) {
    console.log("can't save");
    return
  } else {
    console.log("save Success")
  }
})