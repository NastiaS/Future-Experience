// category-route-test.js

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var expect = require('chai').expect;
var assert = require("chai").assert;

var mongoose = require('mongoose');
var Promise = require('bluebird');
var http = require("http");
var app = require("../../../server/app");
var request = require("supertest");


require('../../../server/db/models/user');

var User = Promise.promisifyAll(mongoose.model('User'));

describe('User route', function () {
    var testUser = {
            firstName : "Hello",
            lastName  : "World",
            email     : "test@gmail.com",
            password  : "password",
            passwordConfirm : "password"
        };
    var createdUser;

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    beforeEach('Create a user', function(done) {
        User.createAsync({
            firstName : "Barack",
            lastName  : "Obama",
            email     : "obama@gmail.com",
            password  : "password",
            passwordConfirm : "password"
        }).then(function(user) {
            createdUser = user;
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    after('Clear test database', function (done) {
        clearDB(done);
    });

    describe('on calling all user routes', function() {
      it('should sign up a new user and return him/her', function () {
          request(app)
              .post("/signup")
              .send(testUser)
              .end( function (err, data) {
                  var user = data.body.user;
                  assert.equal(user.firstName, testUser.firstName);
              });
      });


      it('should login an existing user and return him/her', function () {
          request(app)
              .get("/login")
              .send({
                email : createdUser.email,
                password : createdUser.password
              })
              .end(function (err, data){
                  assert.equal(data.statusCode, 200);
              });
      });

      it('should update specific user', function() {
          request(app)
            .put("/api/user/?user_id="+createdUser.id)
            .send({
              firstName : "Blah"
            })
            .end(function(err, data) {
              var user = data.body;
              assert.notEqual(user.firstName, createdUser.firstName);
              assert.equal(user.firstName, "Blah");
            });
      });

      it('should get specific user', function() {
          request(app)
          .get("/api/user/?user_id="+createdUser.id)
          .end(function(err, data) {
              var user = data.body;
              assert.equal(user.firstName, createdUser.firstName);
          });
      });

      it('should delete specific user', function() {
          request(app)
          .delete("/api/user/?user_id="+createdUser.id)
          .end(function(err, data) {
              var user = data.body;
              assert.equal(user.firstName, createdUser.firstName);
          });
      });

    });
});