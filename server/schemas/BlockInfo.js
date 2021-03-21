'use strict';

const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    NUMBER: {type: Number, required: true, unique: true},
    POSITION_LIST: {type: [Number], required: true},
});

module.exports = mongoose.model('BlockInfo', BlockSchema); 