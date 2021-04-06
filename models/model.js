var initModels = require("../models/init-models");
var sequelize  = require("../models/index").sequelize;
var models = initModels(sequelize);


const User = models.redhat_user;
const Question = models.question;
const QuestionOption = models.question_option;
const QuestionBank = models.question_bank;
const QuestionCollection = models.question_collection;
const QuestionHistory = models.question_history;
const QuestionHistoryItem = models.question_history_item;


exports.User = User;
exports.Question  = Question;
exports.QuestionBank = QuestionBank;
exports.QuestionOption = QuestionOption;
exports.QuestionCollection =QuestionCollection;
exports.QuestionHistory = QuestionHistory;
exports.QuestionHistoryItem =QuestionHistoryItem;
