/**
 * Main application routes
 */

'use strict';

var path = require('path');

module.exports = function(app) {

  // Insert routes below
  //app.use('/api/things', require('./api/thing'));
  //app.use('/api/users', require('./api/user'));
  app.use('/api/turtle_users', require('./api/turtle_user'));

  //app.use('/auth', require('./auth'));
};
