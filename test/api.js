process.env.NODE_ENV = 'test';

var config = require('../config');

var Sequelize = require('sequelize');

var sequelize = require('../db').db();

var databaseModels = require('../database-models');

var Post = databaseModels.Post;
var User = databaseModels.User;
var DeletedPost = databaseModels.DeletedPost;

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

var server = require('../app');

var p = null;

before('setup the db', function() {

   if(p) {
    return p;
   }

  return p = sequelize.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true})
  .then(function(){

    return databaseModels.User.sync({force: true});

  })
  .then(function() {

    return databaseModels.Post.sync({force: true});

  })
  .then(function() {

    return databaseModels.DeletedPost.sync({force: true});

  });

});

describe('/GET posts', function() {
  it('should GET latest posts with empty db', function(done) {

    chai.request(server)
    .get('/posts')
    .end(function(err, res) {
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.be.eql(0);
      done();
    });

  });

});

describe('/GET admin', function() {
  it('should GET admin login page', function(done) {

    chai.request(server)
    .get('/admin')
    .end(function(err, res) {
      res.should.have.status(401);
      done();
    });

  });

  it('should login correctly', function(done) {

    chai.request(server)
    .get('/admin')
    .auth(config.api.username, config.api.password)
    .end(function(err, res) {
      res.should.have.status(200);
      res.should.be.html;
      done();
    });

  });

});
