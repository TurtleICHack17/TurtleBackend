'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TurtleVideoSchema = new Schema({
  fromId : String,
  toId   : String,
  url  : String
});

module.exports = mongoose.model('TurtleVideo', TurtleVideoSchema);
