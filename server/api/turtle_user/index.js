'use strict';

var express = require('express');
var controller = require('./turtle_user.controller');
var config = require('../../config/environment');
//var auth = require('../../auth/auth.service');
var multer = require('multer');
var upload = multer({dest: __dirname + '/uploads'});

var router = express.Router();

router.get('/', controller.index);
router.delete('/:id', controller.destroy);
router.get('/me', controller.me);
router.put('/:id/password', controller.changePassword);
router.get('/:id', controller.show);
router.post('/', controller.create);

// TODO
router.post('/:fromId/video/:toId', upload.single('myVideoFile'), controller.handleVideo);
router.get('/video/:videoId', controller.getVideo);
router.get('/:id/current', controller.getCurrent);
router.post('/:thisId/swipeleft/:otherId', controller.handleSwipeLeft);
router.post('/:thisId/swiperight/:otherId', controller.handleSwipeRight);

module.exports = router;
