var Sequelize = require('sequelize');
var express = require('express');
var cors = require('cors');
var basicAuth = require('express-basic-auth');
var exphbs = require('express-handlebars');
var app = express();


var config = require('./config');

app.use(cors());

var basicAuthOptions = {
  users: {},
  challenge: true
};

basicAuthOptions.users[config.api.username] = config.api.password;

app.engine('handlebars', exphbs({defaultLayout: 'admin'}));
app.set('view engine', 'handlebars');

var databaseModels = require('./database-models');

var Post = databaseModels.Post;
var User = databaseModels.User;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/posts', function (req, res) {

  Post.findAll({
    limit: 30,
    order: [
      ['createdAt', 'DESC']
    ]
  })
  .then(function(posts) {

    res.json(posts);

  });

});

app.get('/posts/:time', function (req, res) {

  res.header('Access-Control-Allow-Origin', '*');

  Post.findAll({
    where: {
      createdAt: {
        [Sequelize.Op.gt]: new Date(req.params.time * 1000)
      }
    },
    order: [
      ['createdAt', 'DESC']
    ]
  })
  .then(function(posts) {

    res.json(posts);

  });

});

app.get('/admin', basicAuth(basicAuthOptions), function (req, res) {

  Post.findAll({
    order: [
      ['createdAt', 'DESC']
    ]
  })
  .then(function(posts) {

    res.render('admin', {
      posts: posts
    });

  });

});

app.get('/admin/delete/:id', basicAuth(basicAuthOptions), function (req, res) {

  Post.findById(req.params.id)
  .then(function(post) {
    return post.destroy();
  })
  .then(function() {
    res.redirect("/admin");
  });

});

var server = app.listen(config.api.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});
