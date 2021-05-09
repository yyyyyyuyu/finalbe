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
var Poetry = require('../models/model').Poetry;
var PoetryBank = require('../models/model').PoetryBank;

exports.getPoetry = function (req,res){
  let token = util.getToken(req);
  let {poetryEdition} = req.query;
  let userId ;
  let pbankId ;
  let poetryArr = [];
  let temppoetryAll = [];
  let currentPoetry = [];

  util.verifyToken(token).then(decoded => {
    userId = decoded.payload.id;
    return PoetryBank.findOne({
      where: {
        edition: poetryEdition
      }
    })
  }).then(data => {
    console.log(data);
    pbankId = data.dataValues.pbank_id;
    return Poetry.findAll({
      where: {
        pbank_id:pbankId
      }
    })
  }).then(data => {
    console.log(data);
    poetryArr = data.map(function (value, index, array){
      return value.dataValues;
    })
    let arr1 = JSON.stringify(poetryArr);
    temppoetryAll = JSON.parse(arr1);
    let allre = /\@+/;
    for(let i =0;i<temppoetryAll.length;i++){
      let poetry_notes = temppoetryAll[i].poetry_notes;
      let poetry_major =temppoetryAll[i].poetry_major;
      let poetry_translation = temppoetryAll[i].poetry_translation;
      let poetry_appreciation = temppoetryAll[i].poetry_appreciation;
      let testarr = [poetry_major,poetry_notes,poetry_translation,poetry_appreciation];
      let testpoetryarr = [];
      for(let k=0;k<4;k++){
        testpoetryarr[k]= new Array();
      }
      for(let t=0;t<testarr.length;t++) {
        if (!testarr[t]) {
          continue;
        }
        let arrmajor1 = testarr[t].split(allre);
        let arrmj = [];
        for (let j = 0; j < arrmajor1.length; j++) {
          if(arrmajor1[j]){
            arrmj[j] = arrmajor1[j];
            testpoetryarr[t].push(arrmj[j]);
          }
          console.log(arrmj[j]);
        }
      }
       testpoetryarr[0] = testpoetryarr[0].map(function (value,index) {
         return value.trim();
       });
      testpoetryarr[2] = testpoetryarr[2].map(function (value,index) {
        return value.trim();
      });
        let value = {
        poetry_name: temppoetryAll[i].poetry_name,
        poetry_author: temppoetryAll[i].poetry_author,
        poetry_major: testpoetryarr[0],
        poetry_notes: testpoetryarr[1],
        poetry_translation: testpoetryarr[2],
        poetry_appreciation: testpoetryarr[3],
        pbank_id: pbankId,
      };
      currentPoetry.push(value);
    }
    console.log(currentPoetry);
    res.json({
      currentPoetry
    })
  })
    .catch( exp => {
      // 失败处理
      console.log(exp);
      res.status(http.STATUS_NOT_FOUND).json({ error: '找不到用户' });
    })
}
