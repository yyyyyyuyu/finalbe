'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (process.env.SMART_MODE) {
  config.database = process.env.SMART_DB;
  config.username = process.env.SMART_DB_USER;
  config.password = process.env.SMART_DB_PASS;
  config.host = process.env.SMART_DB_HOST;
  sequelize = new Sequelize(config.database, config.username, config.password, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}



Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
