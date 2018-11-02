var databaseModels = require('./database-models');

var sequelize = require('./db').db();

sequelize.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true})
.then(function(){

  return databaseModels.User.sync({force: true});

})
.then(function() {

  return databaseModels.Post.sync({force: true});

})
.then(function() {

  return databaseModels.DeletedPost.sync({force: true});

})
.then(function() {

  return databaseModels.IgnoredUser.sync({force: true});

})
.then(function() {

  console.log('Recreated DB tables');

  process.exit(0);

});