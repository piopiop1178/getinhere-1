'use strict';

const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
    NUMBER: {type: Number, required: true, unique: true},
    POSITION_LIST: {type: [Number], required: true},
    SOURCE_LIST: {type: [String], required: true},
    IMAGE_LIST: {type: [String], required: true},
});

module.exports = mongoose.model('MusicInfo', MusicSchema); 