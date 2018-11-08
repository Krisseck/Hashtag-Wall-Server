var Sequelize = require('sequelize');

var sequelize = require('./db').db();

var Post = sequelize.define('post', {
  link: Sequelize.STRING,
  image: Sequelize.STRING,
  caption: Sequelize.TEXT,
  type: Sequelize.INTEGER(1),
  source_id: Sequelize.BIGINT
}, {
  charset: 'utf8mb4',
  underscored: true
});

var User = sequelize.define('user', {
  username: Sequelize.STRING,
  display_name: Sequelize.STRING,
  avatar: Sequelize.STRING,
  type: Sequelize.INTEGER(1),
  source_id: Sequelize.BIGINT
}, {
  charset: 'utf8mb4',
  underscored: true
});

Post.User = Post.belongsTo(User);

var DeletedPost = sequelize.define('deleted_post', {
  type: Sequelize.INTEGER(1),
  source_id: Sequelize.BIGINT,
  link: Sequelize.STRING
}, {
  charset: 'utf8mb4',
  underscored: true
});

var IgnoredUser = sequelize.define('ignored_user', {
  type: Sequelize.INTEGER(1),
  username: Sequelize.STRING,
  source_id: Sequelize.BIGINT
}, {
  charset: 'utf8mb4',
  underscored: true
});

module.exports = {
  Post: Post,
  User: User,
  DeletedPost: DeletedPost,
  IgnoredUser: IgnoredUser
}
