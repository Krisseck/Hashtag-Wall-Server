var Sequelize = require('sequelize');
var express = require('express');
var cors = require('cors');
var basicAuth = require('express-basic-auth');
var exphbs = require('express-handlebars');
var paginate = require('handlebars-paginate');
var app = express();

var config = require('./config');

app.use(cors());

app.use(express.urlencoded({ extended: true }));

var basicAuthOptions = {
  users: {},
  challenge: true
};

basicAuthOptions.users[config.api.username] = config.api.password;

var hbs = exphbs.create({
  defaultLayout: 'admin',
  helpers: {
    formatDate: function(date) {
      return date.toLocaleString('en-US');
    },
    postType: function(type) {
      switch(type) {
        case 1:
          return 'Instagram';
        break;
        case 2:
          return 'Twitter';
        break;
      }
    },
    paginate: paginate
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

var databaseModels = require('./database-models');

var Post = databaseModels.Post;
var User = databaseModels.User;
var DeletedPost = databaseModels.DeletedPost;
var IgnoredUser = databaseModels.IgnoredUser;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/posts', function (req, res) {

  Post.findAll({
    limit: 30,
    order: [
      ['created_at', 'DESC']
    ],
    include: [
      { model: User }
    ]
  })
  .then(function(posts) {

    res.json(posts);

  });

});

app.get('/posts/:time', function (req, res) {

  Post.findAll({
    where: {
      created_at: {
        [Sequelize.Op.gt]: new Date(parseInt(req.params.time))
      }
    },
    order: [
      ['created_at', 'DESC']
    ],
    include: [
      { model: User }
    ]
  })
  .then(function(posts) {

    res.json(posts);

  });

});

app.get('/admin', basicAuth(basicAuthOptions), function (req, res) {

  var totalPosts = 0;

  var postsPerPage = 10;

  var currentPage = 1;

  var offset = 0;

  Post.count()
  .then(function(postsCount) {

    totalPosts = postsCount;

    if(typeof req.query.p != 'undefined') {
      currentPage = req.query.p;
    }

    offset = (currentPage - 1) * postsPerPage;

    return Post.findAll({
      order: [
        ['created_at', 'DESC']
      ],
      offset: offset,
      limit: postsPerPage,
      include: [
        { model: User }
      ]
    });

  })
  .then(function(posts) {

    res.render('admin', {
      posts: posts,
      pagination: {
        page: currentPage,
        pageCount: Math.ceil(totalPosts / postsPerPage)
      },
      navActive: {
        admin: true
      }
    });

  });

});

app.get('/admin/delete/:id', basicAuth(basicAuthOptions), function (req, res) {

  var postToBeDeleted = {};

  Post.findByPk(req.params.id)
  .then(function(post) {

    postToBeDeleted = post;

    return DeletedPost.create({
      type: post.type,
      source_id: post.source_id
    });

  })
  .then(function() {
    return postToBeDeleted.destroy();
  })
  
  .then(function() {
    res.redirect("/admin");
  });

});

app.get('/admin/ignored-users', basicAuth(basicAuthOptions), function (req, res) {

  var ignoredUsers = [];

  var allUsers = [];

  IgnoredUser.findAll({
    order: [
      ['created_at', 'DESC']
    ]
  })
  .then(function(users) {

    ignoredUsers = users;

    return User.findAll({
      order: [
        ['type', 'ASC'],
        ['username', 'ASC']
      ],
    });

  })
  .then(function(users) {

    allUsers = users;

    res.render('ignored-users', {
      ignoredUsers: ignoredUsers,
      allUsers: allUsers,
      navActive: {
        ignoredUsers: true
      }
    });

  });

});

app.get('/admin/unignore-user/:id', basicAuth(basicAuthOptions), function (req, res) {

  IgnoredUser.findByPk(req.params.id)
  .then(function(user) {

    return user.destroy();

  })
  .then(function() {
    res.redirect("/admin/ignored-users");
  });

});

app.post('/admin/ignore-user', basicAuth(basicAuthOptions), function (req, res) {

  var theUser = {};

  User.findByPk(req.body.user)
  .then(function(user) {

    theUser = user;

    return IgnoredUser.create({
      type: user.type,
      username: user.username,
      source_id: user.source_id
    });

  })
  .then(function() {

    if(req.body.delete_posts) {

      return Post.destroy({
        where: {
          user_id: theUser.id
        }
      });

    } else {

      return 1;

    }

  })
  .then(function() {
    res.redirect("/admin/ignored-users");
  });

});

var server = app.listen(config.api.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});

module.exports = app;