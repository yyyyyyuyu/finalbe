var DataTypes = require("sequelize").DataTypes;
var _pets = require("./pets");
var _question = require("./question");
var _question2 = require("./question2");
var _question22 = require("./question22");
var _question_bank = require("./question_bank");
var _question_collection = require("./question_collection");
var _question_history = require("./question_history");
var _question_history1 = require("./question_history1");
var _question_history_item = require("./question_history_item");
var _question_history_item2 = require("./question_history_item2");
var _question_option = require("./question_option");
var _question_wrong = require("./question_wrong");
var _redhat_user = require("./redhat_user");
var _subject_question = require("./subject_question");
var _test = require("./test");
var _user = require("./user");

function initModels(sequelize) {
  var pets = _pets(sequelize, DataTypes);
  var question = _question(sequelize, DataTypes);
  var question2 = _question2(sequelize, DataTypes);
  var question22 = _question22(sequelize, DataTypes);
  var question_bank = _question_bank(sequelize, DataTypes);
  var question_collection = _question_collection(sequelize, DataTypes);
  var question_history = _question_history(sequelize, DataTypes);
  var question_history1 = _question_history1(sequelize, DataTypes);
  var question_history_item = _question_history_item(sequelize, DataTypes);
  var question_history_item2 = _question_history_item2(sequelize, DataTypes);
  var question_option = _question_option(sequelize, DataTypes);
  var question_wrong = _question_wrong(sequelize, DataTypes);
  var redhat_user = _redhat_user(sequelize, DataTypes);
  var subject_question = _subject_question(sequelize, DataTypes);
  var test = _test(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);


  return {
    pets,
    question,
    question2,
    question22,
    question_bank,
    question_collection,
    question_history,
    question_history1,
    question_history_item,
    question_history_item2,
    question_option,
    question_wrong,
    redhat_user,
    subject_question,
    test,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
