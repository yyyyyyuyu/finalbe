var util = require('../utils/utils');
const http = require('../utils/http');
const { Op } = require("sequelize");

var User = require('../models/model').User;
var Question = require('../models/model').Question;
var QuestionBank = require('../models/model').QuestionBank;
var QuestionOption = require('../models/model').QuestionOption;
var QusetionCollection = require('../models/model').QuestionCollection;


/**
 * 获取题目信息 并将其转换成前端需要展示的格式
 * @param req
 * @param res
 */
exports.getQuestionItem = function (req, res){
  console.log(req.query);
  let qInfo = req.query.qinfo;
  let token = req.query.token;
/*  let qInfo = req.qinfo;
  let token = req.token;*/
  if(typeof qInfo === "string") {
    qInfo = JSON.parse(qInfo);
  }
  let qItem = {
    subjectType :qInfo.subType,
    subjectGrade : qInfo.subGrade,
    subjectTerm : qInfo.subTerm,
  }
  let questionList = [];
  let questionIdArr = [];
  let questionAll =[] ; //返回给前端的问题 主体
  let subUnits = 0; //一个题库中有多少个单元
  let userId  = 0;
  let qColletionAll = [];

  console.log(qItem);
  util.verifyToken(token).then(decoded =>{
    userId = decoded.payload.id;
    return  QuestionBank.findAll({
      where: {
        [Op.and]: [
          {
            status: 1,
          },
          {
            subjectType: qItem.subjectType
          },
          {
            subjectGrade: qItem.subjectGrade
          },
          {
            subjectTerm: qItem.subjectTerm,
          }
        ]
      }
    })
  } ).then(data => {
    console.log(data);
    let qbankItem = data[0].dataValues;
    console.log(qbankItem);
    let qbankId = data[0].dataValues.qbank_id;
    subUnits = data[0].dataValues.subjectUnit;
    return Question.findAll({
      where: {
        qbank_id: qbankId
      }
    })
  }).then(data => {
    if(!data){
      res.status(http.STATUS_NOT_FOUND).json({ error: '找不到题目' });
      return;
    }
    questionList = data.map(function (value, index, array){
      return value.dataValues;
    });
    questionIdArr = questionList.map(function (value, index, array){
      return value.question_id;
    });
    console.log(data);
    return QusetionCollection.findAll({
      where: {
        userId: userId
      }
    })
  }).then( data => {
    console.log(data);
    if(data.length >= 1){
      qColletionAll = data.map(function (value, index, array){
        return value.dataValues;
      })
    }
    return QuestionOption.findAll({
      where: {
        question_id : questionIdArr
      }
    })
  }).then( data => {
    console.log(data);
    let optionData = data.map(function (value, index, array){
      return value.dataValues;
    });
    let qIndex = 0;
    let optionItem ;
    let qoptionIndex = 0;

    for (let i =0; i < questionList.length ; i++){
      qIndex = questionList[i].option_amount;
      let optionsList = [];
      for(let j =0;j<qIndex; j++){
        optionItem = {
          option_id : optionData[qoptionIndex].option_id,
          question_id: optionData[qoptionIndex].question_id,
          option_seq: optionData[qoptionIndex].option_seq,
          option_desc: optionData[qoptionIndex].option_desc,
        }
        optionsList.push(optionItem);
        qoptionIndex++;
      }
      let value = {
        question_id: questionList[i].question_id,
        q_name : questionList[i].q_name,
        q_type : questionList[i].q_type,
        qbank_id: questionList[i].qbank_id,
        correct_answer: questionList[i].correct_answer,
        q_points: questionList[i].q_points,
        explain: questionList[i].explain,
        isStore: 0,  //0 代表未收藏  1代表收藏了
        optionsList: optionsList,
        isAnswer: 0,
      }
      questionAll.push(value);
    }
    console.log(questionAll);
    for(let i =0;i<qColletionAll.length;i++){
      let collectionInde = questionIdArr.indexOf(qColletionAll[i].questionId);
      if(collectionInde != -1){
        questionAll[collectionInde].isStore = 1;
      }
    }
    console.log(questionAll);
    let testarr = util.randomSelection(questionAll , subUnits);
    console.log(testarr);
    res.json({
      questionAll : testarr,
      subUnits: subUnits,
    });
  })
    .catch((exp) => {
    // 失败处理
    console.log(exp);
    res.status(http.STATUS_NOT_FOUND).json({ error: '找不到题目' });
  });
}



let item = [
  {
    "id": 1,
    "type": "单选",
    "a": "C",
    "q": "1949年9月21日，毛泽东在中国人民政治协商会议第一届全体会议上发表的开幕词是()。",
    "isStore": "false",
    "isAnswer": 0,
    "options": [{
      "label": "A",
      "text": "《中国革命和中国共产党》"
    }, {
      "label": "B",
      "text": "《论人民民主专政》"
    }, {
      "label": "C",
      "text": "《中国人民站起来了》"
    }]
  }
]

