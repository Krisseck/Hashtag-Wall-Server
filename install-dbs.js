var config = require('./config');

var databaseModels = require('./database-models');

databaseModels.User.sync({force: true})
.then(function() {

  return databaseModels.Post.sync({force: true});

})
.then(function() {

  console.log('Recreated DB tables');

  process.exit(0);

});