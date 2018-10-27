var Sequelize = require('sequelize');

var config = require('./config');

var sequelize = require('./db').db();

module.exports = {
  Post: sequelize.define('post', {
    link: Sequelize.STRING,
    image: Sequelize.STRING,
    caption: Sequelize.TEXT,
    type: Sequelize.INTEGER(1),
    user: Sequelize.INTEGER(9),
    source_id: Sequelize.BIGINT
  }, {
    charset: 'utf8mb4'
  }),
  User: sequelize.define('user', {
    username: Sequelize.STRING,
    display_name: Sequelize.STRING,
    avatar: Sequelize.STRING,
    type: Sequelize.INTEGER(1),
    source_id: Sequelize.BIGINT
  }, {
    charset: 'utf8mb4'
  })
}
