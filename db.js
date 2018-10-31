var db = null;

var Sequelize = require('sequelize');

var config = require('./config');

exports.db = function() {

  if (db === null) {

    db = new Sequelize(config.db.database, config.db.username, config.db.password, {
      dialect: 'mysql',
      host: config.db.host,
      port: config.db.ports,
      logging: false
    });

  }

  return db;

}
