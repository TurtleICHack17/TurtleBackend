'use strict';

var express = require('express');
var controller = require('./turtle_user.controller');
var config = require('../../config/environment');
//var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.delete('/:id', controller.destroy);
router.get('/me', controller.me);
router.put('/:id/password', controller.changePassword);
router.get('/:id', controller.show);
router.post('/', controller.create);

// TODO
router.get('/:id/stack', controller.getMatchStack);
router.post('/:id/swiperight', controller.getMatchStack);
router.post('/:id/swipeleft', controller.getMatchStack);

module.exports = router;
