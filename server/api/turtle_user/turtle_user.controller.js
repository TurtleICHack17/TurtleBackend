'use strict';

var IP = '129.31.231.107';

var TurtleUser = require('./turtle_user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');

var emotions = require('./emotions.js');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of turtle_users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  TurtleUser.find({}, function (err, turtle_users) {
    console.log('turtle user index endpoint');
    if(err) return res.status(500).send(err);
    res.status(200).json(turtle_users);
  });
};

/**
 * Creates a new turtle_user
 */
exports.create = function (req, res, next) {
  var newTurtleUser = new TurtleUser(req.body);
  newTurtleUser.provider = 'local';
  newTurtleUser.role = 'turtle_user';
  newTurtleUser.save(function(err, turtle_user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: turtle_user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single turtle_user
 */
exports.show = function (req, res, next) {
  var turtle_userId = req.params.id;

  TurtleUser.findById(turtle_userId, function (err, turtle_user) {
    if (err) return next(err);
    if (!turtle_user) return res.status(401).send('Unauthorized');
    res.json(turtle_user.profile);
  });
};

/**
 * Deletes a turtle_user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  TurtleUser.findByIdAndRemove(req.params.id, function(err, turtle_user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a turtle_users password
 */
exports.changePassword = function(req, res, next) {
  var turtle_userId = req.turtle_user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  TurtleUser.findById(turtle_userId, function (err, turtle_user) {
    if(turtle_user.authenticate(oldPass)) {
      turtle_user.password = newPass;
      turtle_user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var turtle_userId = req.turtle_user._id;
  TurtleUser.findOne({
    _id: turtle_userId
  }, '-salt -hashedPassword', function(err, turtle_user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!turtle_user) return res.status(401).send('Unauthorized');
    res.json(turtle_user);
  });
};

exports.handleVideo = function(req, res, next) {
  var wstream = fs.createWriteStream('temp.mp4');
  //wsteam.write();
  console.log(req);
  var path = req.file.path;
  var idFrom = req.params.idFrom;
  var idTo = req.params.idTo;
  // TODO : save (id, path)
  res.json({
    "status" : "ok"
  });
};

exports.getVideo = function(req, res, next) {
  var filePath = __dirname + '/uploads/' + req.params.videoId;
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type' : 'video/mp4',
    'Content-Length' : stat.size
  });
  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
};

exports.getStack = function(req, res, next) {
  // TODO
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
