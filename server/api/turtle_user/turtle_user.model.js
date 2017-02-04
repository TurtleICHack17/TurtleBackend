'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var TurtleUserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  fbUserId: String,
  gender: {type : String, default : "male"}, // assume their gender
  current : {type : [String], default : []},
  accepted : {type : [String], default : []},
  declined : {type : [String], default : []},
  matches: {type : [String], default : []}
});

/**
 * Virtuals
 */

// Public profile information
TurtleUserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name
    };
  });

/**
 * Validations
 */

// Validate empty email
TurtleUserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate email is not taken
TurtleUserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
TurtleUserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

  /*
    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
   */
      next();
  });

module.exports = mongoose.model('TurtleUser', TurtleUserSchema);
