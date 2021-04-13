var util = require('../utils/utils');
const http = require('../utils/http');
const { Op } = require("sequelize");

var moment = require('moment');
var User = require('../models/model').User;
var Question = require('../models/model').Question;
var QuestionBank = require('../models/model').QuestionBank;
var QuestionOption = require('../models/model').QuestionOption;
var QusetionCollection = require('../models/model').QuestionCollection;
var QuestionHistory = require('../models/model').QuestionHistory;
var QuestionHistoryItem =require('../models/model').QuestionHistoryItem;




exports.postHistory = function (req, res){
  let token = util.getToken(req);
  let {currentQuestion, qhistory_name , qhistory_unit , correct_times, subType} = req.body;
  subType = JSON.parse(subType);
  let userId ;
  let qhistoryItem = [];
  let isStore = 0;
  let qCollectionAll = [];
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    return QuestionHistory.create({
      user_id: userId,
      qhistory_name,
      qhistory_unit,
      correct_times,
      subjectType:subType
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
      if(currentQuestion[i].isStore){
        let value1 = {
          userId:userId,
          questionId: currentQuestion[i].question_id
        }
        qCollectionAll.push(value1);
      }
    }
    let qhistoryRes = await QuestionHistoryItem.bulkCreate(qhistoryItem);
    return QusetionCollection.bulkCreate(qCollectionAll);
  }).then( data => {
    console.log( data);
  })

    .catch((exp) => {
    // 失败处理
    console.log(exp);
    res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
  });
}

/**
 * 获取用户练习过的记录
 * @param req
 * @param res
 */
exports.getHistory = function (req, res) {
  let token = util.getToken(req);
  let qhistoryAll =[];
  let qhistoryId = [];
  let qhistoryItemAll = [];
  let qhistoryItemCount = [];
  let currentqhistory = [];
  let allqHistory = [];
  let questionIdArr = [];
  let questionList = [];
  let questionAll = [];
  let qColletionAll = [];
  let userId ;
  let removeQuestion= [];
  let removerQuestionId = [];
  let removeQbankId = [];
  util.verifyToken(token).then(decoded => {
     userId = decoded.payload.id;
    return QuestionHistory.findAll({
      where: {
        user_id: userId
      }
    })
  }).then( data => {
    console.log(data);
    qhistoryAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    qhistoryId = qhistoryAll.map(function (value, index, array){
      return value.qhistory_id;
    })
    return QuestionHistoryItem.count({
      where: {
        qhistory_id: qhistoryId
      },
      group: 'qhistory_id'
    })
  }).then( data => {
    console.log(data);
    qhistoryItemCount = data.map(function (value, index, array){
      return value.count;
    });
    return QuestionHistoryItem.findAll({
      where: {
        qhistory_id: qhistoryId
      }
    })
  }).then( data => {
    qhistoryItemAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    questionIdArr = qhistoryItemAll.map(function (value, index, array){
      return value.question_id;
    })
    return Question.findAll({
      where:{
        question_id: questionIdArr
      },
    })
  }).then( async data => {
    console.log(data);
     removeQuestion = data.map(function (value, index, array){
      return value.dataValues;
    })
     removerQuestionId =removeQuestion.map(function (value, index, array){
      return value.question_id;
    })
    removeQbankId = removeQuestion.map(function (value, index, array){
      return value.qbank_id;
    })
    return QuestionOption.findAll({
      where: {
        question_id : removerQuestionId
      }
    })
  }).then( async data => {
    console.log(data);
    let optionData = data.map(function (value, index, array){
      return value.dataValues;
    });
    let result = await QusetionCollection.findAll({
      where: {
        userId: userId
      }
    })
    if(result.length >= 1){
      qColletionAll = result.map(function (value, index, array){
        return value.dataValues;
      })
    }
    for(let i =0;i<qColletionAll.length;i++){
      let collectionInde = removerQuestionId.indexOf(qColletionAll[i].questionId);
      if(collectionInde != -1){
        removeQuestion[collectionInde].isStore = 1;
      }
    }
    let qbankData = await QuestionBank.findAll({
      where:{
       qbank_id: removeQbankId
      }
    })

    let questionMap = new Map();
    qbankData.forEach(function (value,index, array){
      questionMap.set(value.qbank_id, index);
    })
    let subType = qbankData.map(function (value,index,array){
      return value.subjectType;
    })


    // 根据 题目ID 获取了相关数据  最后将题目与单元 匹配
    let qIndex = 0;
    let optionItem ;
    let qoptionIndex = 0;

    for (let i =0; i < removeQuestion.length ; i++){
      qIndex = removeQuestion[i].option_amount;
      let optionsList = [];
      for(let j =0;j<qIndex; j++){
        let option_seq_name = util.num2letter(optionData[qoptionIndex].option_seq);
        optionItem = {
          option_id : optionData[qoptionIndex].option_id,
          question_id: optionData[qoptionIndex].question_id,
          option_seq: optionData[qoptionIndex].option_seq,
          option_desc: optionData[qoptionIndex].option_desc,
          option_seq_name:option_seq_name
        }
        optionsList.push(optionItem);
        qoptionIndex++;
      }
      console.log(removeQuestion[i].question_id);
      let qbankIndex = questionMap.get(removeQuestion[i].qbank_id);
      removeQuestion[i].subType = qbankData[qbankIndex].subjectType;
      let value = {
        question_id: removeQuestion[i].question_id,
        q_name : removeQuestion[i].q_name,
        q_type : removeQuestion[i].q_type,
        qbank_id: removeQuestion[i].qbank_id,
        correct_answer: removeQuestion[i].correct_answer,
        q_points: removeQuestion[i].q_points,
        explain: removeQuestion[i].explain,
        isStore: removeQuestion[i].isStore,  //0 代表未收藏  1代表收藏了
        optionsList: optionsList,
        subType: removeQuestion[i].subType,
        isAnswer: 0,
      }
      questionAll.push(value);
    }
    console.log(questionAll); // questionALL 只是去重后 问题与选项 结合一起之后的数据 （还是去重）


    let qhitemId = 0;
    for(let i =0;i<qhistoryAll.length;i++){
      let qhitemArr = [];
      for(let j =0;j<qhistoryItemCount[i];j++){
        let qhis2queId = removerQuestionId.indexOf(qhistoryItemAll[qhitemId].question_id);
        let value = Object.assign({}, questionAll[qhis2queId])
        value.isAnswer = qhistoryItemAll[qhitemId].is_answer ;
        value.isCorrect = qhistoryItemAll[qhitemId].is_correct;
        value.qhistory_name = qhistoryAll[i].qhistory_name;
        qhitemArr.push(value);
        qhitemId++;
      }
      allqHistory.push(qhitemArr);
      qhistoryAll[i].subType = util.num2subject(qhistoryAll[i].subType );
    }
/*    let qhitemId = 0;
    for(let i =0;i<qhistoryAll.length;i++){
      let qhitemArr = [];
      for(let j =0;j<qhistoryItemCount[i];i++){
        questionAll[qhitemId].is_answer = qhistoryItemAll[qhitemId].is_answer ;
        questionAll[qhitemId].is_correct = qhistoryItemAll[qhitemId].is_correct;
        questionAll[qhitemId].qhistory_name = qhistoryAll[i].qhistory_name;
        qhitemArr.push(questionAll[qhitemId]);
        qhitemId++;
      }
      allqHistory.push(qhitemArr);
    }*/
    console.log(allqHistory);
    res.json({
      allqHistory,
      qhistoryAll,
    });
  })

    .catch( exp => {
    // 失败处理
    console.log(exp);
    res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
  })
}


/**
 * 获取错题
 * @param req
 * @param res
 */
exports.getWrongQuestion = function (req,res){
    let token = util.getToken(req);
    let questionTypeAll = [];//按照 科目分类生成的数组
    let subTypeNum = 3; //科目种类
    let qhistoryAll =[];
    let qhistoryId = [];
    let qhistoryItemAll = [];
    let qhistoryItemCount = [];
    let currentqhistory = [];
    let allqHistory = [];
    let questionIdArr = [];
    let questionList = [];
    let questionAll = [];
    let qColletionAll = [];
    let userId ;
    let removeQuestion= [];
    let removerQuestionId = [];
    let removeQbankId = [];
    util.verifyToken(token).then(decoded => {
      userId = decoded.payload.id;
      return QuestionHistory.findAll({
        where: {
          user_id: userId
        }
      })
    }).then( data => {
      console.log(data);
      qhistoryAll = data.map(function (value, index, array){
        return value.dataValues;
      })
      qhistoryId = qhistoryAll.map(function (value, index, array){
        return value.qhistory_id;
      })
      return QuestionHistoryItem.count({
        where: {
          qhistory_id: qhistoryId
        },
        group: 'qhistory_id'
      })
    }).then( data => {
      console.log(data);
      qhistoryItemCount = data.map(function (value, index, array){
        return value.count;
      });
      return QuestionHistoryItem.findAll({
        where: {
          qhistory_id: qhistoryId
        }
      })
    }).then( data => {
      qhistoryItemAll = data.map(function (value, index, array){
        return value.dataValues;
      })
      questionIdArr = qhistoryItemAll.map(function (value, index, array){
        return value.question_id;
      })
      return Question.findAll({
        where:{
          question_id: questionIdArr
        },
      })
    }).then( async data => {
      console.log(data);
      removeQuestion = data.map(function (value, index, array){
        return value.dataValues;
      })
      removerQuestionId =removeQuestion.map(function (value, index, array){
        return value.question_id;
      })
      removeQbankId = removeQuestion.map(function (value, index, array){
        return value.qbank_id;
      })
      return QuestionOption.findAll({
        where: {
          question_id : removerQuestionId
        }
      })
    }).then( async data => {
      console.log(data);
      let optionData = data.map(function (value, index, array){
        return value.dataValues;
      });
      let result = await QusetionCollection.findAll({
        where: {
          userId: userId
        }
      })
      if(result.length >= 1){
        qColletionAll = result.map(function (value, index, array){
          return value.dataValues;
        })
      }
      for(let i =0;i<qColletionAll.length;i++){
        let collectionInde = removerQuestionId.indexOf(qColletionAll[i].questionId);
        if(collectionInde != -1){
          removeQuestion[collectionInde].isStore = 1;
        }
      }
      let qbankData = await QuestionBank.findAll({
        where:{
          qbank_id: removeQbankId
        }
      })

      let questionMap = new Map();
      qbankData.forEach(function (value,index, array){
        questionMap.set(value.qbank_id, index);
      })
      let subType = qbankData.map(function (value,index,array){
        return value.subjectType;
      })


      // 根据 题目ID 获取了相关数据  最后将题目与单元 匹配
      let qIndex = 0;
      let optionItem ;
      let qoptionIndex = 0;

      for (let i =0; i < removeQuestion.length ; i++){
        qIndex = removeQuestion[i].option_amount;
        let optionsList = [];
        for(let j =0;j<qIndex; j++){
          let option_seq_name = util.num2letter(optionData[qoptionIndex].option_seq);
          optionItem = {
            option_id : optionData[qoptionIndex].option_id,
            question_id: optionData[qoptionIndex].question_id,
            option_seq: optionData[qoptionIndex].option_seq,
            option_desc: optionData[qoptionIndex].option_desc,
            option_seq_name:option_seq_name
          }
          optionsList.push(optionItem);
          qoptionIndex++;
        }
        console.log(removeQuestion[i].question_id);
        let qbankIndex = questionMap.get(removeQuestion[i].qbank_id);
        removeQuestion[i].subType = qbankData[qbankIndex].subjectType;
        let value = {
          question_id: removeQuestion[i].question_id,
          q_name : removeQuestion[i].q_name,
          q_type : removeQuestion[i].q_type,
          qbank_id: removeQuestion[i].qbank_id,
          correct_answer: removeQuestion[i].correct_answer,
          q_points: removeQuestion[i].q_points,
          explain: removeQuestion[i].explain,
          isStore: removeQuestion[i].isStore,  //0 代表未收藏  1代表收藏了
          optionsList: optionsList,
          subType: removeQuestion[i].subType,
          isAnswer: 0,
        }
        questionAll.push(value);
      }
      console.log(questionAll); // questionALL 只是去重后 问题与选项 结合一起之后的数据 （还是去重）


      let qhitemId = 0;
      let subTypeAll0 = []; //语文
      let subTypeAll1 = []; //数学
      let subTypeAll2 = []; //英语
      questionTypeAll[0] = [];
      questionTypeAll[1] = [];
      questionTypeAll[2] = [];
      for(let i =0;i<qhistoryAll.length;i++){
        for(let j =0;j<qhistoryItemCount[i];j++){
          let qhis2queId = removerQuestionId.indexOf(qhistoryItemAll[qhitemId].question_id);
          let value = Object.assign({}, questionAll[qhis2queId])
          value.isAnswer = qhistoryItemAll[qhitemId].is_answer ;
          value.isCorrect = qhistoryItemAll[qhitemId].is_correct;
          value.createdAt = qhistoryItemAll[qhitemId].createdAt;
          value.qhistory_name = qhistoryAll[i].qhistory_name;
          allqHistory.push(value);
          if(value.isCorrect ==0){
            questionTypeAll[value.subType].push(value);
          }
          qhitemId++;
        }
      }
      console.log(allqHistory);
      res.json({
        questionTypeAll,
        subTypeNum,
      });
    })

      .catch( exp => {
        // 失败处理
        console.log(exp);
        res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
      })
}

/**
 * 获取每个科目 错题总数
 * @param req
 * @param res
 */
exports.getWrongSubject = function (req,res){
  let token = util.getToken(req);
  let subjectTypeNum = 3; //表示有3个科目
  let questionTypeAll = [];
  for(let i =0;i<subjectTypeNum;i++){
    questionTypeAll[i] = 0;
  }
  let qhistoryAll = [];
  let qhistoryId = [];
  let qhistoryItemAll = [];
  let questionIdArr = [];
  let qhid2subtype = [];
  let qhistoryQuestionId = [];
  let removeQuestion = [];
  let removerQuestionId = [];
  let removeWrongQHisItem = [];
  let removeWrongQHisItemId  =[];
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    return QuestionHistory.findAll({
      where: {
        user_id: userId
      }
    })
  }).then( data => {
    console.log(data);
    qhistoryAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    qhistoryId = qhistoryAll.map(function (value, index, array){
      return value.qhistory_id;
    })
    qhid2subtype = new Map();
    qhistoryAll.forEach(function (value,index, array){
      qhid2subtype.set(value.qhistory_id, value.subjectType);
    })
    return QuestionHistoryItem.findAll({
      where: {
        qhistory_id: qhistoryId
      }
    })
  }).then( data => {
    console.log(data);
    qhistoryItemAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    questionIdArr = qhistoryItemAll.map(function (value, index, array){
      return value.question_id;
    })
    qhistoryItemAll.forEach(function (value, index, array){
      if(value.is_correct == 0){
        removeWrongQHisItem.push(value);
      }
    })
    removeWrongQHisItemId = removeWrongQHisItem.map(function (value, index, array){
      return value.question_id;
    })
    return Question.findAll({
      where:{
        question_id: removeWrongQHisItemId
      },
    })
  }).then( data => {
    console.log(data);
    let removeWrongQuestion = data.map(function (value, index, array){
      return value.dataValues;
    })
    let removeqHistory = removeWrongQuestion.map(function (value, index, array){
      let qhindex = removeWrongQHisItemId.indexOf(value.question_id);
      value.qhistory_id = removeWrongQHisItem[qhindex].qhistory_id;
      return value
    })
    removeqHistory.forEach(function (value, index, array){
      questionTypeAll [ qhid2subtype.get(value.qhistory_id)] ++;
    })
    res.json({
      questionTypeAll,
      subjectTypeNum
    })
  })
}


/**
 * 获取每个科目 错题的题目
 * @param req
 * @param res
 */
exports.getWrongSubQuestion = function (req,res){
  let token = util.getToken(req);
  let {subType}  = req.query;
  subType = JSON.parse(subType);
  let currentWrong = [];
  let questionTypeAll = [];//按照 科目分类生成的数组
  let subTypeNum = 3; //科目种类
  let qhistoryAll =[];
  let qhistoryId = [];
  let qhistoryItemAll = [];
  let qhistoryItemCount = [];
  let currentqhistory = [];
  let allqHistory = [];
  let questionIdArr = [];
  let questionList = [];
  let questionAll = [];
  let qColletionAll = [];
  let userId ;
  let removeQuestion= [];
  let removerQuestionId = [];
  let removeQbankId = [];
  let removeWrongQHisItem = [];
  let removeWrongQHisItemId  =[];
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    return QuestionHistory.findAll({
      where: {
        [Op.and]: [{
          user_id: userId
        },{
          subjectType: subType
        }],
      }
    })
  }).then( data => {
    console.log(data);
    qhistoryAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    qhistoryId = qhistoryAll.map(function (value, index, array){
      return value.qhistory_id;
    })
    return QuestionHistoryItem.findAll({
      where: {
        qhistory_id: qhistoryId
      }
    })
  }).then( data => {
    qhistoryItemAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    questionIdArr = qhistoryItemAll.map(function (value, index, array){
      return value.question_id;
    })

    qhistoryItemAll.forEach(function (value, index, array){
      if(value.is_correct == 0){
        removeWrongQHisItem.push(value);
      }
    })
    removeWrongQHisItemId = removeWrongQHisItem.map(function (value, index, array){
      return value.question_id;
    })
    return Question.findAll({
      where:{
        question_id: removeWrongQHisItemId
      },
    })
  }).then( async data => {
    console.log(data);
    removeQuestion = data.map(function (value, index, array){
      return value.dataValues;
    })
    removerQuestionId =removeQuestion.map(function (value, index, array){
      return value.question_id;
    })
    return QuestionOption.findAll({
      where: {
        question_id : removerQuestionId
      }
    })
  }).then( async data => {
    console.log(data);
    let optionData = data.map(function (value, index, array){
      return value.dataValues;
    });
    let result = await QusetionCollection.findAll({
      where: {
        userId: userId
      }
    })
    if(result.length >= 1){
      qColletionAll = result.map(function (value, index, array){
        return value.dataValues;
      })
    }
    for(let i =0;i<qColletionAll.length;i++){
      let collectionInde = removerQuestionId.indexOf(qColletionAll[i].questionId);
      if(collectionInde != -1){
        removeQuestion[collectionInde].isStore = 1;
      }
    }


    // 根据 题目ID 获取了相关数据  最后将题目与单元 匹配
    let qIndex = 0;
    let optionItem ;
    let qoptionIndex = 0;

    for (let i =0; i < removeQuestion.length ; i++){
      qIndex = removeQuestion[i].option_amount;
      let optionsList = [];
      for(let j =0;j<qIndex; j++){
        let option_seq_name = util.num2letter(optionData[qoptionIndex].option_seq);
        optionItem = {
          option_id : optionData[qoptionIndex].option_id,
          question_id: optionData[qoptionIndex].question_id,
          option_seq: optionData[qoptionIndex].option_seq,
          option_desc: optionData[qoptionIndex].option_desc,
          option_seq_name:option_seq_name
        }
        optionsList.push(optionItem);
        qoptionIndex++;
      }
      console.log(removeQuestion[i].question_id);
      let value = {
        question_id: removeQuestion[i].question_id,
        q_name : removeQuestion[i].q_name,
        q_type : removeQuestion[i].q_type,
        qbank_id: removeQuestion[i].qbank_id,
        correct_answer: removeQuestion[i].correct_answer,
        q_points: removeQuestion[i].q_points,
        explain: removeQuestion[i].explain,
        isStore: removeQuestion[i].isStore,  //0 代表未收藏  1代表收藏了
        optionsList: optionsList,
        subType: subType,
        isAnswer: 0,
      }
      questionAll.push(value);
    }
    console.log(questionAll); // questionALL 只是去重后 并且 全是不重复的错题 问题与选项 结合一起之后的数据 （还是去重）
    let wrongArr = [];
    for(let i =0;i<questionAll.length;i++){
      let wrongIndex = questionIdArr.lastIndexOf(questionAll[i].question_id);
      let wrongItem =  Object.assign({}, questionAll[i]);
      let currentqHistoryId = qhistoryItemAll[wrongIndex].qhistory_id;
      let currentqhistoryIndex = qhistoryId.indexOf(currentqHistoryId);
      wrongItem.isAnswer = qhistoryItemAll[wrongIndex].is_answer ;
      wrongItem.isCorrect = qhistoryItemAll[wrongIndex].is_correct;
      wrongItem.createdAt = JSON.stringify(qhistoryItemAll[wrongIndex].createdAt);
      wrongItem.qhistory_name = qhistoryAll[currentqhistoryIndex].qhistory_name;
      wrongItem.qhistory_unit = qhistoryAll[currentqhistoryIndex].qhistory_unit;
      wrongArr.push(wrongItem);
      /*      if(wrongItem.isCorrect == 0 && qhistoryAll[currentqhistoryIndex].qhistory_unit != 99999){
              wrongArr.push(wrongItem);
            }
            else if ( qhistoryAll[currentqhistoryIndex].qhistory_unit == 99999){
              wrongArr.push(wrongItem);
            }*/
    }
    console.log(wrongArr);
/*    let date2wrong = new Map();
    wrongArr.forEach(function (value, index, array){
      date2wrong.set(value.createdAt, index);
    })
    let dateArr = wrongArr.map(function (value, index, array){
      return value.createdAt;
    })
    dateArr.sort(function(a, b){
      return a < b ? 1 : -1;
    });*/
    let currentWQuestion = [];
    let temp;
    for(let i =0;i<wrongArr.length;i++){
      for(let j = i+1;j<wrongArr.length;j++){
        if(wrongArr[i].createdAt < wrongArr[j].createdAt){
          temp = wrongArr[i];
          wrongArr[i] = wrongArr[j];
          wrongArr[j] = temp;
        }
      }
    }


/*    let qhitemId = 0;
    for(let i =0;i<qhistoryAll.length;i++){
      for(let j =0;j<qhistoryItemCount[i];j++){
        let qhis2queId = removerQuestionId.indexOf(qhistoryItemAll[qhitemId].question_id);
        let value = Object.assign({}, questionAll[qhis2queId])
        value.isAnswer = qhistoryItemAll[qhitemId].is_answer ;
        value.isCorrect = qhistoryItemAll[qhitemId].is_correct;
        value.createdAt = qhistoryItemAll[qhitemId].createdAt;
        value.qhistory_name = qhistoryAll[i].qhistory_name;
        allqHistory.push(value);
        if(value.isCorrect ==0){
          currentWrong.push(value);
        }
        qhitemId++;
      }
    }*/
    console.log(wrongArr);
    res.json({
      wrongArr
    });
  })

    .catch( exp => {
      // 失败处理
      console.log(exp);
      res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
    })
}




/*

/!**
 * 获取用户练习过的记录
 * @param req
 * @param res
 *!/
exports.getHistory = function (req, res) {
  let token = util.getToken(req);
  let qhistoryAll =[];
  let qhistoryId = [];
  let qhistoryItemAll = [];
  let qhistoryItemCount = [];
  let currentqhistory = [];
  let allqHistory = [];
  let questionIdArr = [];
  let questionList = [];
  let questionAll = [];
  let qColletionAll = [];
  let userId ;
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    return QuestionHistory.findAll({
      where: {
        user_id: userId
      }
    })
  }).then( data => {
    console.log(data);
    qhistoryAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    qhistoryId = qhistoryAll.map(function (value, index, array){
      return value.qhistory_id;
    })
    return QuestionHistoryItem.count({
      where: {
        qhistory_id: qhistoryId
      },
      group: 'qhistory_id'
    })
  }).then( data => {
    console.log(data);
    qhistoryItemCount = data;
    return QuestionHistoryItem.findAll({
      where: {
        qhistory_id: qhistoryId
      }
    })
  }).then( data => {
    qhistoryItemAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    questionIdArr = qhistoryItemAll.map(function (value, index, array){
      return value.question_id;
    })
    return Question.findAll({
      where:{
        question_id: questionIdArr
      }
    })
  }).then( data => {
    console.log(data);
    questionList = data.map(function (value, index, array){
      return value.dataValues;
    })
    return QuestionOption.findAll({
      where: {
        question_id : questionIdArr
      }
    })
  }).then( async data => {
    console.log(data);
    let optionData = data.map(function (value, index, array){
      return value.dataValues;
    });

    // 根据 题目ID 获取了相关数据  最后将题目与单元 匹配
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
    let result = await QusetionCollection.findAll({
      where: {
        userId: userId
      }
    })
    if(result.length >= 1){
      qColletionAll = result.map(function (value, index, array){
        return value.dataValues;
      })
    }
    for(let i =0;i<qColletionAll.length;i++){
      let collectionInde = questionIdArr.indexOf(qColletionAll[i].questionId);
      if(collectionInde != -1){
        questionAll[collectionInde].isStore = 1;
      }
    }
    console.log(questionAll);
    let qhitemId = 0;
    for(let i =0;i<qhistoryAll.length;i++){
      let qhitemArr = [];
      for(let j =0;j<qhistoryItemCount[i];i++){
        questionAll[qhitemId].is_answer = qhistoryItemAll[qhitemId].is_answer ;
        questionAll[qhitemId].is_correct = qhistoryItemAll[qhitemId].is_correct;
        questionAll[qhitemId].qhistory_name = qhistoryAll[i].qhistory_name;
        qhitemArr.push(questionAll[qhitemId]);
        qhitemId++;
      }
      allqHistory.push(qhitemArr);
    }
    console.log(allqHistory);
    res.json({
      allqHistory,
      qhistoryAll,
    });
  })

    .catch( exp => {
      // 失败处理
      console.log(exp);
      res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
    })
}
*/
