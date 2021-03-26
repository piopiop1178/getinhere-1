'use strict';

const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    NUMBER: {type: Number, required: true, unique: true},
    SOURCE_PATH: {type: String, required: true},
});

module.exports = mongoose.model('CharacterInfo', CharacterSchema); 