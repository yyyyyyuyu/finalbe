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
          questionId: currentQuestion[i].question_id,
          status:1
        }
        qCollectionAll.push(value1);
      }
    }
    let qhistoryRes = await QuestionHistoryItem.bulkCreate(qhistoryItem);
    //return QusetionCollection.bulkCreate(qCollectionAll);
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
      if(collectionInde != -1 ){
        if(qColletionAll[i].status == 1){
          removeQuestion[collectionInde].isStore = 1;
        }
        else{
          removeQuestion[collectionInde].isStore = 0;
        }
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
        isStore: removeQuestion[i].isStore || 0,  //0 代表未收藏  1代表收藏了
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
      qhistoryAll[i].subType = util.num2subject(qhistoryAll[i].subjectType );
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


exports.postCollectionQuestion = function (req, res){
  let token = util.getToken(req);
  let {currentQuestion, subType} = req.body;
  let userId ;
  subType = JSON.parse(subType);
  let questionId= currentQuestion.map(function (value,index){
    return value.question_id
  })

  util.verifyToken(token).then(async decoded => {
    userId = decoded.payload.id;
    let qCollection = await QusetionCollection.findAll({
      where:{
        [Op.and]: [
          {  userId: userId,},
          { questionId: questionId,}
        ],
      }
    });
    qCollection =qCollection.map(function (value, index, array){
      return value.dataValues;
    })
    let qColletionId = qCollection.map(function (value, index, array){
      return value.questionId;
    })
    let len1 = currentQuestion.length;
    let len2 = qCollection.length;
    let qCollectionAll =[];
    if(len1 == len2){
      for(let i=0;i<len1;i++){
        let value;
        let currentIndex = questionId.indexOf(qColletionId[i]);
        if(currentQuestion[currentIndex].isStore){
          value = {
            qcollection_id: qCollection[i].qcollection_id,
            userId:userId,
            questionId: currentQuestion[currentIndex].question_id,
            status: 1,
            subjectType:subType
          }
        }
        else {
          value = {
            qcollection_id: qCollection[i].qcollection_id,
            userId:userId,
            questionId: currentQuestion[currentIndex].question_id,
            status: 0,
            subjectType: subType
          }
        }
        qCollectionAll.push(value);
      }
      let qcstatus = qCollectionAll.map(function (value, index, array){
        return value.status;
      })
      let qcid = qCollectionAll.map(function (value, index, array){
        return value.qcollection_id;
      })
      let qcRes = await  QusetionCollection.bulkCreate(qCollectionAll, { updateOnDuplicate: ["status","updatedAt"] })
      console.log(qcRes);
    }
    else{
      for(let i=0;i<len2;i++){
        let value;
        let currentIndex = questionId.indexOf(qColletionId[i]);
        currentQuestion[currentIndex].isSelected = 1;
        if(currentQuestion[currentIndex].isStore){
          value = {
            qcollection_id: qCollection[i].qcollection_id,
            userId:userId,
            questionId: currentQuestion[currentIndex].question_id,
            status: 1,
            subjectType:subType
          }
        }
        else {
          value = {
            qcollection_id: qCollection[i].qcollection_id,
            userId:userId,
            questionId: currentQuestion[currentIndex].question_id,
            status: 0,
            subjectType:subType
          }
        }
        qCollectionAll.push(value);
      }
      let qcstatus = qCollectionAll.map(function (value, index, array){
        return value.status;
      })
      let qcid = qCollectionAll.map(function (value, index, array){
        return value.qcollection_id;
      })
      let updateRes = await  QusetionCollection.bulkCreate(qCollectionAll, { updateOnDuplicate: ["status","updatedAt"] })
      console.log(updateRes);
      let otherQCollection = [];
      for(let i=0;i<len1;i++){
        if(currentQuestion[i].isSelected != 1){
          let value1 ;
          if(currentQuestion[i].isStore){
            value1 = {
              userId:userId,
              questionId: currentQuestion[i].question_id,
              status: 1,
              subjectType:subType
            }
          }
          else {
            value1 = {
              userId:userId,
              questionId: currentQuestion[i].question_id,
              status: 0,
              subjectType:subType
            }
          }
          otherQCollection.push(value1);
        }
      }
      let createRes = await QusetionCollection.bulkCreate(otherQCollection);
      console.log(createRes);
    }
    res.json({success: "success",
    })
  })
    .catch(async (merr) => {
      // console.error(merr);
      try {
        res.status(http.STATUS_BAD_REQ).json({ error: 'UPDATE_FAIL11', data: createErr });
      } catch (createErr) {
        res.status(http.STATUS_BAD_REQ).json({ error: 'UPDATE_FAIL', data: createErr });
      }
    });
}



exports.getCollectionQuestion =function (req,res){

}




/** 停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用停用
 * 获取错题     停用停用停用停用停用停用停用
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
        if(collectionInde != -1 ){
          if(qColletionAll[i].status == 1){
            removeQuestion[collectionInde].isStore = 1;
          }
          else{
            removeQuestion[collectionInde].isStore = 0;
          }
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
  let userId;
  let qCollectionAll ;
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
  }).then( async data => {
    console.log(data);
    let qcarr = await QusetionCollection.findAll({
      where: {
        userId: userId
      }
    })
    if(qcarr.length>1){
      qCollectionAll = qcarr.map(function (value, index, array){
        return value.dataValues;
      })
    }

    qhistoryItemAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    questionIdArr = qhistoryItemAll.map(function (value, index, array){
      return value.question_id;
    })

    for(let i =0;i<qCollectionAll.length;i++){
      let collectionInde = questionIdArr.indexOf(qCollectionAll[i].questionId);
      if(collectionInde != -1 ){
        if(qCollectionAll[i].status == 1){
          qhistoryItemAll[collectionInde].isStore = 1;
        }
        else{
          qhistoryItemAll[collectionInde].isStore = 0;
        }
      }
    }
    qhistoryItemAll.forEach(function (value, index, array){
      if((value.is_correct == 0 && value.is_answer !=0 )|| value.isStore){
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
    let removeWrongQuestion = data.map(function (value, index, array){
      return value.dataValues;
    })
    let removeqHistory = removeWrongQuestion.map(function (value, index, array){
      let qhindex = removeWrongQHisItemId.indexOf(value.question_id);
      value.qhistory_id = removeWrongQHisItem[qhindex].qhistory_id;
      value.isStore = removeWrongQHisItem[qhindex].isStore;
      return value;
    })
    let removeqHistoryId = removeqHistory.map(function (value, index, array){
      return value.question_id;
    })
/*    removeqHistory.forEach(function (value, index, array){
      questionTypeAll[ qhid2subtype.get(value.qhistory_id)] ++;
    })*/

    //以上为获取错题练习中的 错题跟 收藏题目的记录
    //下面要获取 收藏表中 不重复的题目记录

    for(let i =0;i<qCollectionAll.length;i++){
      let collectionInde = removeqHistoryId.indexOf(qCollectionAll[i].questionId);
      if(collectionInde == -1 ){
        if(qCollectionAll[i].status == 1){
          let value = {
            question_id: qCollectionAll[i].questionId,
            subType: qCollectionAll[i].subjectType ,
            status: qCollectionAll[i].status
          }
          removeqHistory.push(value);
        }
      }
    }
    removeqHistory.forEach(function (value, index, array){
      if(value.subType >=0){
        questionTypeAll[value.subType] ++;
      }
      else{
        questionTypeAll[ qhid2subtype.get(value.qhistory_id)] ++;
      }
    })

/*

    let qcquestionId = qCollectionAll.map(function (value,index){
      return value.question_id;
    })
    let qc2question = await Question.findAll({
      where: {
        question_id: qcquestionId
      }
    })
    qc2question = qc2question.map(function (value, index, array){
      return value.dataValues
    })
    let arrqbank = qc2question.map(function (value, index, array){
      return value.qbank_id
    })
    let arrqid = qc2question.map(function (value, index, array){
      return value.question_id
    })
    let qc2qsubtype = await QuestionBank.findAll({
      where:{
        qbank_id: arrqbank
      }
    })
    qc2qsubtype = qc2qsubtype.map(function (value, index, array){
      return value.dataValues;
    })
    let arrqsubtype = qc2qsubtype.map(function (value, index, array){
      return value.subjectType;
    })
    for(let i =0;i<qCollectionAll.length;i++){
      let collectionInde = removeqHistoryId.indexOf(qCollectionAll[i].questionId);
      if(collectionInde == -1 ){
        if(qCollectionAll[i].status == 1){
          let value = {
            question_id: qCollectionAll[i].question_id,
            subType: subType ,
            status: qCollectionAll[i].status
          }
          removeqHistory.push(value);
          qhistoryItemAll[collectionInde].isStore = 1;
        }
        else{
          qhistoryItemAll[collectionInde].isStore = 0;
        }
      }
    }*/

/*    removeqHistory.forEach(function (value, index, array){
      if(value.subType){
        questionTypeAll[value.subType] ++;
      }
      else{
        questionTypeAll[ qhid2subtype.get(value.qhistory_id)] ++;
      }
    })*/



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
  let qCollectionAll =[];
  let optionData ;
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
  }).then( async data => {
    let qcarr = await QusetionCollection.findAll({
      where: {
        [Op.and]: [{userId: userId},
          {subjectType: subType}
        ],

      }
    })
    if(qcarr.length>1){
      qCollectionAll = qcarr.map(function (value, index, array){
        return value.dataValues;
      })
    }
    qhistoryItemAll = data.map(function (value, index, array){
      return value.dataValues;
    })
    questionIdArr = qhistoryItemAll.map(function (value, index, array){
      return value.question_id;
    })
    for(let i =0;i<qCollectionAll.length;i++){
      let collectionInde = questionIdArr.indexOf(qCollectionAll[i].questionId);
      if(collectionInde != -1 ){
        if(qCollectionAll[i].status == 1){
          qhistoryItemAll[collectionInde].isStore = 1;
        }
        else{
          qhistoryItemAll[collectionInde].isStore = 0;
        }
      }
    }

    qhistoryItemAll.forEach(function (value, index, array){
      if(value.is_correct == 0 && value.is_answer !=0){
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
    optionData = data.map(function (value, index, array){
      return value.dataValues;
    });
/*    let result = await QusetionCollection.findAll({
      where: {
        userId: userId
      }
    })
    if(result.length >= 1){
      qColletionAll = result.map(function (value, index, array){
        return value.dataValues;
      })
    }*/
    let otherQCollection = [];
    let otherQCollectionOption = [];
    for(let i =0;i<qCollectionAll.length;i++){
      let collectionInde = removerQuestionId.indexOf(qCollectionAll[i].questionId);
      if(collectionInde != -1 ){
        let updatedAt ;
        updatedAt = qCollectionAll[i].updatedAt>= removeQuestion[collectionInde].updatedAt ? qCollectionAll[i].updatedAt : removeQuestion[collectionInde].updatedAt;
        if(qCollectionAll[i].status == 1){
          removeQuestion[collectionInde].isStore = 1;
          removeQuestion[collectionInde].updatedAt = updatedAt;
        }
        else{
          removeQuestion[collectionInde].isStore = 0;
        }
      }
      else{
        otherQCollection.push(qCollectionAll[i]);
      }
    }
    let otherQCollectionId = otherQCollection.map(function (value, index, array){
      return value.questionId
    })
    let otherQCarr = await Question.findAll({
      where:{
        question_id: otherQCollectionId
      }
    })
    otherQCarr = otherQCarr.map(function (value, index, array){
      return value.dataValues;
    })
    let otherQCarrId = otherQCarr.map(function (value, index, array){
      return value.question_id;
    })
    let otherQCarrQbankId = otherQCarr.map(function (value, index, array){
      return value.qbank_id;
    })
    let otherQCoption = await QuestionOption.findAll({
      where: {
        question_id: otherQCarrId
      }
    })
    otherQCoption = otherQCoption.map(function (value,index){
      return value.dataValues;
    })
    let optionsum ;
    //
    for(let i =0;i< otherQCarr.length;i++){
      let index = otherQCollectionId.indexOf(otherQCarrId[i]);
      //otherQCollection[index] = otherQCarr[i];
      // 判断一下 otherQCollection[i] 是否收藏了 然后让 isStore =1
      if(otherQCollection[index].status == 1){
        otherQCarr[i].isStore = 1;
        otherQCarr[i].qctionupdate = otherQCollection[index].updatedAt;
        removeQuestion.push(otherQCarr[i]);
        optionsum = otherQCarr[i].option_amount;
        for(let j =0;j<optionsum; j++){
          optionData.push(otherQCoption[j]);
        }
      }
      else{
        otherQCarr[i].isStore = 0;
      }

    }


/*    for(let i =0;i<qCollectionAll.length;i++){
      let collectionInde = removerQuestionId.indexOf(qCollectionAll[i].questionId);
      if(collectionInde == -1 ){
        if(qCollectionAll[i].status == 1){
          let value = {
            question_id: qCollectionAll[i].questionId,
            subType: qCollectionAll[i].subjectType ,
            status: qCollectionAll[i].status
          }
          removeQuestion.push(value);
        }
      }
    }*/



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
        updatedAt: removeQuestion[i].updatedAt,
        isStore: removeQuestion[i].isStore || 0,  //0 代表未收藏  1代表收藏了
        optionsList: optionsList,
        subType: subType,
        isAnswer: 0,
        qctionupdate: removeQuestion[i].qctionupdate
      }
      questionAll.push(value);
    }
    console.log(questionAll); // questionALL 只是去重后 并且 全是不重复的错题 问题与选项 结合一起之后的数据 （还是去重）
    let wrongArr = [];
    for(let i =0;i<questionAll.length;i++){
      let wrongIndex = questionIdArr.lastIndexOf(questionAll[i].question_id);
      if(wrongIndex != -1){
        let lastcreatedAt;
        if(questionAll[i].updatedAt){
          lastcreatedAt =  questionAll[i].updatedAt >= qhistoryItemAll[wrongIndex].updatedAt ? questionAll[i].updatedAt : qhistoryItemAll[wrongIndex].updatedAt;
        }
        else{
          lastcreatedAt = qhistoryItemAll[wrongIndex].updatedAt;
        }
        let wrongItem =  Object.assign({}, questionAll[i]);
        let currentqHistoryId = qhistoryItemAll[wrongIndex].qhistory_id;
        let currentqhistoryIndex = qhistoryId.indexOf(currentqHistoryId);
        wrongItem.isAnswer = qhistoryItemAll[wrongIndex].is_answer ;
        wrongItem.isCorrect = qhistoryItemAll[wrongIndex].is_correct;
        wrongItem.WrongQ = 1;
        wrongItem.createdAt = JSON.stringify(lastcreatedAt);
        wrongItem.qhistory_name = qhistoryAll[currentqhistoryIndex].qhistory_name;
        wrongItem.qhistory_unit = qhistoryAll[currentqhistoryIndex].qhistory_unit;
        wrongArr.push(wrongItem);
      }
      else{
        let wrongItem =  Object.assign({}, questionAll[i]);
        wrongItem.createdAt = JSON.stringify(questionAll[i].qctionupdate);
        wrongItem.isAnswer = 0;
        wrongItem.isCorrect = 0;
        wrongItem.CollectionQ = 1;
        wrongArr.push(wrongItem);
      }


      /*      if(wrongItem.isCorrect == 0 && qhistoryAll[currentqhistoryIndex].qhistory_unit != 99999){
              wrongArr.push(wrongItem);
            }
            else if ( qhistoryAll[currentqhistoryIndex].qhistory_unit == 99999){
              wrongArr.push(wrongItem);
            }*/
    }
    console.log(wrongArr);
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
