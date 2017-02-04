'use strict';

var should = require('should');
var app = require('../../app');
var TurtleUser = require('./turtle_user.model');

var turtle_user = new TurtleUser({
  provider: 'local',
  name: 'Fake TurtleUser',
  email: 'test@test.com',
  password: 'password'
});

describe('TurtleUser Model', function() {
  before(function(done) {
    // Clear turtle_users before testing
    TurtleUser.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    TurtleUser.remove().exec().then(function() {
      done();
    });
  });

  it('should begin with no turtle_users', function(done) {
    TurtleUser.find({}, function(err, turtle_users) {
      turtle_users.should.have.length(0);
      done();
    });
  });

  it('should fail when saving a duplicate turtle_user', function(done) {
    turtle_user.save(function() {
      var turtle_userDup = new TurtleUser(turtle_user);
      turtle_userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function(done) {
    turtle_user.email = '';
    turtle_user.save(function(err) {
      should.exist(err);
      done();
    });
  });

  it("should authenticate turtle_user if password is valid", function() {
    return turtle_user.authenticate('password').should.be.true;
  });

  it("should not authenticate turtle_user if password is invalid", function() {
    return turtle_user.authenticate('blah').should.not.be.true;
  });
});
