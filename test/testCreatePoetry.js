var User = require('../models/model').User;
var Question = require('../models/model').Question;
var QuestionBank = require('../models/model').QuestionBank;
var QuestionOption = require('../models/model').QuestionOption;
var Poetry = require('../models/model').Poetry
const util = require("../utils/utils");


var test = function () {
  let subjectType = [0, 1, 2];  //0:语文 1:数学 2:英语
  let arr
  subjectType.forEach(function (value,index){
    value = num2subject(value);
    return value;
  })
  subjectType.forEach(function (value,index){
    console.log(value);
  })
  console.log(arr);
  console.log(subjectType);
}

var test1 = function (){
  let str="11、发射第一颗人造卫星的国家是：(C) 10、选用无磷洗衣粉的目的是（B）"
  let re = /[A-Z]、|[A-Z]\./;
  let rrre = /\（\s*[A-E]\s*\）/
  let arr =str.split(rrre);
  console.log(arr);
}
const num2subject = function ( num ){
  let subtype ;
  switch (num){
    case 0:
      subtype = '语文';
      break;
    case 1:
      subtype = '数学';
      break;
    case 2:
      subtype = '英语';
      break;
    default:
      subtype = '语文';
      break;
  }
  return subtype;
}


const fs = require('fs');
const readline = require('readline');
const fidName = "./txt/poetry1.txt";
var pbankId = 38; //几年级几学期  1-12 语文 13-24 数学 25-36 英语    37中国文化知识 38 小学科学竞赛知识

let arrstring;

/**
 * 读取txt文件
 * @returns {Promise<string>}
 */
async function processLineByLine() {
  const fileStream = fs.createReadStream(fidName);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // 注意：我们使用 crlfDelay 选项将 input.txt 中的所有 CR LF 实例（'\r\n'）识别为单个换行符。
  let arr = new Array();
  let arrName = [];
  let arrOption = [{}, {}];
  let arrAnswer = '';
  let explain = [];
  rl.on('line', (line) => {
    arr.push(line);
    //console.log(`文件中的每一行: ${line}`);
  });

  await new Promise((resolve) => {
    rl.once('close', function () {
      resolve();
    });
  });

  /*    for (const line of rl) {
          arr.push(line);
          // input.txt 中的每一行在这里将会被连续地用作 `line`。
         // console.log(`Line from file: ${line}`);
      }*/
  arrstring = arr.join('@');

  /*    for (let i of arr){
          console.log(i);
      }*/
  return arrstring;
}

var fstest = function () {
  return processLineByLine();
}

/**
 * 将txt文件切割 并上传数据到相应数据库
 * @param arrstr
 * @returns {Promise<void>}
 * @constructor
 */
var RegTest = async function (arrstr) {
  console.assert(!(!arrstr));
  let re = /\d+、/;
  let strarr = arrstr.split(re);
  let len = strarr.length;
  let arrName = [];
  let arrAnswer = '';
  let explain = [];
  let index = 0;
  let valueArrQues = []; // 问题描述
  let valueArrOptions = []  //选项描述

  let qoptionItem = []; //该选项属于题目ID中的哪个

  for (let i = 1; i < len; i++) {
    let re1 = /【注释】/;
    let arr1 = strarr[i].split(re1);
    let re2 = /【译文】/;
    let arr2 = arr1[1].split(re2);
    let re3 = /【赏析】/;
    let arr3 = arr2[1].split(re3);

    let re10 = /\$\$/;
    let arr110 = arr1[0].split(re10);
    let arrname = arr110[0];//古诗题目
    let re110 = /\#\#/;
    let arr111 = arr110[1].split(re110);
    let arrauthor = arr111[0]; //古诗作者
    let arrmajor =arr111[1];//古诗主体

/*
    let allre = /\@+/;
    let arrmajor1 = arrmajor.split(allre);
    let arrmj = [];
    for(let j =0;j<arrmajor1.length;j++){
      arrmj[j] = arrmajor1[j];
      console.log(arrmj[j]);
    }
*/


    console.log("题目: " + arrname);
    console.log("作者: " + arrauthor);
    console.log("主体: " + arrmajor);
    console.log("注释: " + arr2[0]);
    console.log("译文: " + arr3[0]);
    console.log("赏析: " + arr3[1]);

    let allre = /\@+/;
    let testarr = arrname.split(allre);
    arrname=testarr[0];
    let testarr1 = arrauthor.split(allre);
    arrauthor = testarr1[0];

    let poetry_name = arrname;
    let poetry_author = arrauthor;
    let poetry_notes =arr2[0];
    let poetry_major = arrmajor;
    let poetry_translation =arr3[0];
    let poetry_appreciation = arr3[1];
    let pbank_id =1;

    //前端处理每行自带@逻辑
/*    let testarr = [poetry_name,poetry_author,poetry_major,poetry_notes,poetry_translation,poetry_appreciation]
    let allre = /\@+/;
    for(let t=0;t<testarr.length;t++){
      if(!testarr[t]) {continue;}
      let arrmajor1 = testarr[t].split(allre);
      let arrmj = [];
      for(let j =0;j<arrmajor1.length;j++){
        arrmj[j] = arrmajor1[j];
        console.log(arrmj[j]);
      }
    }*/



    let value = {
      poetry_name: poetry_name,
      poetry_author: poetry_author,
      poetry_notes: poetry_notes,
      poetry_major: poetry_major,
      poetry_translation: poetry_translation,
      poetry_appreciation: poetry_appreciation,
      pbank_id: pbank_id,
    };
    valueArrQues.push(value);
  }

  console.log(valueArrQues);

 const arrQues = await Poetry.bulkCreate(valueArrQues);



  console.log(valueArrQues);
  console.log(arrQues);

}

function letter2number(data) {
  let value;
  switch (data) {
    case 'A':
      value = 1;
      break;
    case 'B':
      value = 2;
      break;
    case 'C':
      value = 3;
      break;
    case 'D':
      value = 4;
      break;
    case 'E':
      value = 5;
      break;
    case 'F':
      value = 6;
      break;
    default:
      value = 0;
  }
  return value;
}

/**
 * 自定义函数名：PrefixZero
 * @param num： 被操作数
 * @param n： 固定的总位数
 */
function PrefixZero(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}

/**
 * 上传中国文化知识库
 * @returns {Promise<void>}
 */
var testPoetry = async function () {
  let arrstr = await fstest();
  await RegTest(arrstr);
}








let Grade =  [0, 1, 2, 3, 4, 5]; //年级 一到六
let Term  = [0, 1]; //学期
let subjectType = [0, 1, 2];  //0:语文 1:数学 2:英语
let qBankArr = [];

var updateQBank = function (type, grade, term){
  let subTypeName = util.num2subject(type);
  let subType = type;
  let subGrade = grade;
  let subTerm = term;
  let semesterName  =  util.num2term(subGrade * 2 + term);
  let stageEducation = "小学"
  let qBank = stageEducation + subTypeName + semesterName + "题库";
  let qBankStatus = 1;//题库状态 1代表使用
  let value  = {
    name: qBank,
    status: qBankStatus,
    priority: 1,
    subjectType :subType,
    subjectUnit : 0,
    subjectGrade : subGrade+1,
    subjectTerm : subTerm,
  }
  qBankArr.push(value);
  console.log(qBank);
  console.log(value);
}


var testQbank = function (){
  for(let t = 0; t<subjectType.length ;t++){
    for(let i =0;i<Grade.length ;i++){
      for(let j = 0;j<Term.length ; j++){
        updateQBank(t , i , j);
      }
    }
  }
  let res = QuestionBank.bulkCreate(qBankArr);
  console.log(res);
}

module.exports = {
  test,
  testPoetry,
  testQbank,
  test1
}
