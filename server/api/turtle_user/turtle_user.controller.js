'use strict';

var IP = '129.31.231.107';

var TurtleUser = require('./turtle_user.model');
var TurtleVideo = require('./turtle_video.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');

var emotions = require('./emotions.js');

////////////////////////////////////////////

// updates current list of considered users
function updateCurrent(userId) {
  TurtleUser.findOne({fbUserId : userId}, function(err, thisUser) {
    if (err) {
      console.log(err);
    }
    console.log('thisUser');
    console.log(thisUser);
    TurtleUser.find({}, function(err, otherUsers) {
      for (var i = 0; i<otherUsers.length; i++) {
        var otherUser = otherUsers[i];
        console.log('otherUser');
        console.log(otherUser);
        if (thisUser.fbUserId == otherUser.fbUserId) continue;
        if (thisUser.accepted.indexOf(otherUser.fbUserId) > -1) continue;
        if (thisUser.declined.indexOf(otherUser.fbUserId) > -1) continue;
        if (thisUser.current.indexOf(otherUser.fbUserId) > -1) continue;
        TurtleUser.findByIdAndUpdate(
            thisUser._id,
            {$push: {"current": otherUser.fbUserId}},
            {safe: true, upsert: true},
            function(err, model) {
              if (err) console.log(err);
            }
        );
      }
    });
  });
}

////////////////////////////////////////////

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
  console.log(req.body);
  TurtleUser.findOne({fbUserId : req.body.fbUserId}, function(err, previous_user) {
    if (!previous_user) {
      console.log('new user');
      var newTurtleUser = new TurtleUser(req.body);
      newTurtleUser.save(function(err, turtle_user) {
        if (err) return validationError(res, err);
        //var token = jwt.sign({_id: turtle_user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
        updateCurrent(turtle_user.fbUserId);
        res.json({ "status" : "success" });
      });
    } else {
      console.log('existing user');
      res.json({ "status" : "success" });
    }
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
  //var wstream = fs.createWriteStream('temp.mp4');
  //wsteam.write();
  console.log(req);
  if (!req.file) {
    res.json({
      "status" : "error"
    });
    return;
  }
  var path = req.file.path;
  var filename = req.file.filename;
  var fromId = req.params.fromId;
  var toId = req.params.toId;
  console.log(path);

  var newTurtleVideo = new TurtleVideo({
    "fromId" : fromId,
    "toId" : toId,
    "url" : /*IP + ':9000/api/turtle_users/video/' +*/ filename
  });
  newTurtleVideo.save(function(err, turtle_video) {
    console.log('saved video');
    // TODO : call Emotion API
    emotions.handleVideo(turtle_video);
    res.json({ "status" : "success" });
  });
};

exports.handleSwipeRight = function(req, res, next) {
  var otherUserId = req.params.otherId;
  var thisUserId = req.params.thisId;
  TurtleUser.update(
    {fbUserId : thisUserId},
    {"$push" : {"accepted" : otherUserId}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err) console.log(err);
      console.log('added');
    }
  );
  TurtleUser.update(
    {fbUserId : thisUserId},
    {"$pull" : {"current" : otherUserId}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err) console.log(err);
      console.log('removed');
    }
  );
  TurtleUser.update(
    {fbUserId : otherUserId},
    {"$push" : {"current" : thisUserId}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err) console.log(err);
      console.log('added to current');
    }
  );
  console.log(otherUserId);
  // TODO : respond depending on if the other person swiped right on me
  // if the other person has already swiped on me
  TurtleUser.findOne({fbUserId : otherUserId}, function(err, turtle_user) {
    console.log(turtle_user);
    if (err) {
      console.log(err);
      return;
    }
    if (turtle_user.accepted.indexOf(thisUserId) > -1) {
      // the other user swiped right on this user
      TurtleVideo.findOne({
        fromId : otherUserId,
        toId : thisUserId
      },
      function(err, turtle_video) {
        res.json({
          "needsVideo" : false,
          "videoUrl" : turtle_video.url 
        });
      });
    } else {
      res.json({
        "needsVideo" : true
      });
    }
  });
}

exports.handleSwipeLeft = function(req, res, next) {
  var otherUserId = req.params.otherId;
  var thisUserId = req.params.thisId;
  TurtleUser.update(
    {fbUserId : thisUserId},
    {"$push" : {"declined" : otherUserId}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err) console.log(err);
      console.log('added');
    }
  );
  TurtleUser.update(
    {fbUserId : thisUserId},
    {"$pull" : {"current" : otherUserId}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err) console.log(err);
      console.log('removed');
    }
  );
  res.json({"status" : "ok"});
}

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

exports.getCurrent = function(req, res, next) {
  var thisId = req.params.id;
  TurtleUser.findOne({fbUserId : thisId}, function(err, turtle_user) {
    if (!turtle_user) {
      console.log('no user found');
      res.json([]);
      return;
    }
    if (err) {
      console.log(err);
      return;
    }
    console.log(turtle_user.current);
    var size = turtle_user.current.length;
    var names = [];
    for (var i = 0; i < size; i++) {
      var userId = turtle_user.current[i];
      TurtleUser.findOne({fbUserId : userId}, function(err, turtle_user2) {
        names.push({
          fbUserId : turtle_user2.fbUserId,
          name : turtle_user2.name
        });
        if (names.length == size) {
          res.json(names);
        }
      })
    }
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
