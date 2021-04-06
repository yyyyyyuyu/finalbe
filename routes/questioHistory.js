var util = require('../utils/utils');
const http = require('../utils/http');
const { Op } = require("sequelize");

var User = require('../models/model').User;
var Question = require('../models/model').Question;
var QuestionBank = require('../models/model').QuestionBank;
var QuestionOption = require('../models/model').QuestionOption;
var QusetionCollection = require('../models/model').QuestionCollection;
var QuestionHistory = require('../models/model').QuestionHistory;
var QuestionHistoryItem =require('../models/model').QuestionHistoryItem;

exports.postHistory = function (req, res){
  var {currentQuestion, token, qhistory_name , qhistory_unit} = req.body;
  let userId ;
  let qhistoryItem = [];
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    return QuestionHistory.create({
      user_id: userId,
      qhistory_name,
      qhistory_unit,
    });
  }).then( async data => {
    console.log(data);
    let qhistory_id = data.dataValues.qhistory_id;
    let qlen = currentQuestion.length;
    for(let  i =0; i <qlen ;i++){
      let value ={
        qhistory_id: qhistory_id,
        question_id: currentQuestion[i].question_id,
        is_answer: currentQuestion[i].isAnswer,
        is_correct: currentQuestion[i].isCorrect,
      }
      qhistoryItem.push(value);
    }
    let qhistoryRes = await QuestionHistoryItem.bulkCreate(qhistoryItem);
  })
    .catch((exp) => {
    // 失败处理
    console.log(exp);
    res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
  });
}
