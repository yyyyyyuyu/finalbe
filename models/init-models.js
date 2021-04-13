var DataTypes = require("sequelize").DataTypes;
var _poetry = require("./poetry");
var _poetry_bank = require("./poetry_bank");
var _question = require("./question");
var _question_bank = require("./question_bank");
var _question_collection = require("./question_collection");
var _question_history = require("./question_history");
var _question_history_item = require("./question_history_item");
var _question_option = require("./question_option");
var _question_wrong = require("./question_wrong");
var _redhat_user = require("./redhat_user");

function initModels(sequelize) {
  var poetry = _poetry(sequelize, DataTypes);
  var poetry_bank = _poetry_bank(sequelize, DataTypes);
  var question = _question(sequelize, DataTypes);
  var question_bank = _question_bank(sequelize, DataTypes);
  var question_collection = _question_collection(sequelize, DataTypes);
  var question_history = _question_history(sequelize, DataTypes);
  var question_history_item = _question_history_item(sequelize, DataTypes);
  var question_option = _question_option(sequelize, DataTypes);
  var question_wrong = _question_wrong(sequelize, DataTypes);
  var redhat_user = _redhat_user(sequelize, DataTypes);


  return {
    poetry,
    poetry_bank,
    question,
    question_bank,
    question_collection,
    question_history,
    question_history_item,
    question_option,
    question_wrong,
    redhat_user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
