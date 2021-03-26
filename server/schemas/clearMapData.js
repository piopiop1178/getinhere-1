'use strict';

require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, 
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
).then(() => console.log('MongoDB connected...')).catch(error => console.log(error))

mongoose.connection.db.dropCollection('MapInfo');
mongoose.connection.db.dropCollection('BlockInfo');
mongoose.connection.db.dropCollection('MusicInfo');

