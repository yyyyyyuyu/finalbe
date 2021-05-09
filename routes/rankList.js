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
var RankList = require('../models/model').RankList;

exports.postRankList = function (req,res){
  let token = util.getToken(req);
  let { subType , correctNum} = req.body;
  subType = JSON.parse(subType);
  correctNum = JSON.parse(correctNum);
  let userId  ;
  let rankInfo ;
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    rankInfo = {
      user_id: userId,
      subjectType: subType,
      correct_num: correctNum
    }
    console.log(rankInfo);
    RankList.findAll({
      where:{
        [Op.and]: [
          {
          user_id: userId
        },
          {
          subjectType: subType
        }]
      }
    }).then( async data => {
      if (data.length ===0 ) {
        try {
          let createRes = await  RankList.create({
            user_id: rankInfo.user_id,
            subjectType: rankInfo.subjectType,
            correct_num: rankInfo.correct_num
          });
          console.log("createRes:")
          console.log(createRes);
          res.json({  data: createRes });
          return;
        } catch (createErr) {
          res.status(http.STATUS_BAD_REQ).json({ error: 'CREATE_FAIL', data: createErr });
          return;
        }
      }
      console.log(data);
      let rankData = data[0].dataValues;
      let rankId = rankData.rank_id;
      let ranknum = rankData.correct_num;
      rankData.correct_num = ranknum + rankInfo.correct_num;
      let updateRes = await RankList.update({
        correct_num: rankData.correct_num
      },{
        where:{
          rank_id: rankId
        }
      })
      console.log( updateRes);
      res.json({updateRes})
    })
      .catch(async (merr) => {
        // console.error(merr);
        try {
          res.status(http.STATUS_BAD_REQ).json({ error: 'UPDATE_FAIL11', data: createErr });
        } catch (createErr) {
          res.status(http.STATUS_BAD_REQ).json({ error: 'UPDATE_FAIL', data: createErr });
        }
      });
  })
}

exports.getRankList = function (req,res){
  let token = util.getToken(req);
  let { subType } = req.query;
  subType = JSON.parse(subType);
  let userId;
  let rankInfo;
  let userInfoId;
  let allUserInfo;
  let rankData = [];
  let limitRank = 10; //只显示前10名用户
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id
    return RankList.findAll({
      order:[
        ['correct_num', 'DESC']
      ],
      where: {
        subjectType: subType
      },
      limit: 10  //只显示前10名用户
    })
  }).then(  data => {
    console.log(data);
    rankInfo = data.map(function (value, index, array){
      return value.dataValues;
    })
    userInfoId = rankInfo.map(function (value, index, array){
      return value.user_id;
    })
    return User.findAll({
      where: {
        id: userInfoId
      }
    })
  }).then( async data=> {
    console.log(data);
    allUserInfo = data.map(function (value, index, array){
      return value.dataValues;
    })
    for(let i =0;i<rankInfo.length;i++){
      let value = {
        user_id: allUserInfo[i].id,
        nickName: allUserInfo[i].nickName,
        avatar_url: allUserInfo[i].avatar_url,
        correct_num: rankInfo[i].correct_num
      }
      rankData.push(value);
    }
    console.log(rankData);
    let userInfo;
    rankData.forEach(function (value, index, array){
      if(userId == value.user_id){
        userInfo = value;
      }
    })
    if(!userInfo){
      let userdata = await User.findByPk(userId);
      userInfo = userdata.dataValues;
      userInfo.correct_num = 0;
    }

    console.log(userInfo);
    res.json({
      rankData,
      userInfo
    })
  })
}

exports.getAllRankList = function (req,res){
  let token = util.getToken(req);
  let { rankLen,subType } = req.query;
  rankLen = JSON.parse(rankLen);
  subType = JSON.parse(subType);
  let userId;
  let rankInfo;
  let userInfoId;
  let allUserInfo;
  let rankData = [];
  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id
    return RankList.findAll({
      order:[
        ['correct_num', 'DESC']
      ],
      where: {
        subjectType: subType
      }
    })
  }).then( data => {
    console.log(data);
    rankInfo = data.map(function (value, index, array){
      return value.dataValues;
    })
    userInfoId = rankInfo.map(function (value, index, array){
      return value.user_id;
    })
    return User.findAll({
      where: {
        id: userInfoId
      }
    })
  }).then( async data => {
    console.log(data);
    allUserInfo = data.map(function (value, index, array){
      return value.dataValues;
    })
    for(let i =0;i<rankInfo.length;i++){
      let value = {
        user_id: allUserInfo[i].id,
        nickName: allUserInfo[i].nickName,
        avatar_url: allUserInfo[i].avatar_url,
        correct_num: rankInfo[i].correct_num
      }
      rankData.push(value);
    }
    console.log(rankData);
    let userInfo;
    rankData.forEach(function (value, index, array){
      if(userId == value.user_id){
        userInfo = value;
      }
    })
    if(!userInfo){
      let userdata = await User.findByPk(userId);
      userInfo = userdata.dataValues;
      userInfo.correct_num = 0;
    }
    console.log(userInfo);
    res.json({
      rankData,
      userInfo
    })
  })
}


exports.createRankList = (rankInfo) => {
  return new Promise(((resolve, reject) => {
    RankList.create({
      user_id: rankInfo.user_id,
      subjectType: rankInfo.subjectType,
      correct_num: rankInfo.correct_num
    })
      .then((data) => {
        // console.log(data.dataValues.id);
        let rankId = data.dataValues.rank_id;
        resolve(rankId);
      })
      .catch((createErr) => {
        // console.error(createErr);
        reject(createErr);
      });
  }))
}

exports.editRankList = (rankId, rankInfo) => {
  return new  Promise((resolve, reject) => {
    RankList.update({
      user_id: rankInfo.user_id,
      subjectType: rankInfo.subjectType,
      correct_num: rankInfo.correct_num
    },{
      where:{
        rank_id: rankId
      }
    })
      .then((data) => {
        // console.log(data);
        if (data[0] === 0) {
          reject(data);
        }
        resolve(data);
      })
      .catch((setErr) => {
        // console.error(setErr);
        reject(setErr);
      });
  })
}
