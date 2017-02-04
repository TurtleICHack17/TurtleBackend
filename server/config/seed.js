/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var TurtleUser = require('../api/turtle_user/turtle_user.model');

// Insert seed data below
var thingSeed = require('../api/thing/thing.seed.json');
var turtleUserSeed = require('../api/turtle_user/turtle_user.seed.json');

// Insert seed inserts below
TurtleUser.find({}).remove(function() {
  TurtleUser.create(turtleUserSeed);
  console.log('seed');
});
