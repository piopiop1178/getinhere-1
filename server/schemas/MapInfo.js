'use strict';

const mongoose = require('mongoose');

const MapSchema = new mongoose.Schema({
    NUMBER: {type: Number, required: true, unique: true},
    TILE_LENGTH: {type: Number, required: true, min:1},
    TILE_WIDTH: {type: Number, required: true, min:1},
    TILE_HEIGHT: {type: Number, required: true, min:1},
    BACKGROUND_IMG_PATH: {type: String, default: '#FFFFFF'}, // filesystem상의 이미지 경로
    // BLOCKED_AREA: [Number], // 막힌구역 DB 형태
});

// mongoose.model의 첫번째 인자인 MapInfo의 소문자 형태로
// collection 이름이 결정
module.exports = mongoose.model('MapInfo', MapSchema); 