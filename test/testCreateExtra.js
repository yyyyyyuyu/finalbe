var User = require('../models/model').User;
var Question = require('../models/model').Question;
var QuestionBank = require('../models/model').QuestionBank;
var QuestionOption = require('../models/model').QuestionOption;
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
const fidName = "./txt/science1.txt";
var qbankId = 38; //几年级几学期  1-12 语文 13-24 数学 25-36 英语    37中国文化知识 38 小学科学竞赛知识

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
  arrstring = arr.join('');

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

  let ree = /答案：/;
  let stringarr = arrstr.split(ree);
  let stringlen = stringarr.length;
  let stringarr1 = stringarr[1];
  let ree1 = /[A-Z]{1}/;
  let answerarr = [];
  let stringarr2 = stringarr1.split(" ");
  let answerindex= 0;
  for(let i =0;i<20;i++){
    for(let j =0;j<stringarr2[i].length;j++){
      answerarr[answerindex] = stringarr2[i][j];
      answerindex++;
    }
  }

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

    let re1 = /[A-Z]、/;
    let arr1 = strarr[i].split(re1);

    let arr11 = arr1[0];
    let len11 = arr1.length - 1;
    let arr12 = [];
    console.log("题目" + index + arr11);
    qoptionItem[index] = len11;
    index++;


    let qName = arr11; //题目描述
    let qType = 999; // 0 单选题  1 多选题 2 判断题 3 填空题
    let correctAnswer = letter2number(answerarr[i-1]); //正确答案
    let qPoints = ''; //考点
    let explain = ''; //解析
    let value = {
      q_name: qName,
      q_type: qType,
      qbank_id: qbankId,
      priority: 100,
      qstatus: 1,
      correct_answer: correctAnswer,
      q_points: qPoints,
      explain: explain,
      option_amount: qoptionItem[index - 1]
    };
    valueArrQues.push(value);

    for (let j = 0; j < len11; j++) {
      arr12[j] = arr1[j + 1];
      console.log(arr12[j]);

      let optionSeq = j + 1 ; //选项出现的位置  选项ABCD可能颠倒位置
      let optionDesc = arr12[j]; //每个选项的描述
      let isCorrect = 0; // 0：错误 1：正确 代表这个选项是否是正确的   例： 1.正确答案是 B  ，而此选项代表A  则为0

      if (j + 1 === correctAnswer) {
        isCorrect = 1;
      }

      let value2 = {
        option_seq: optionSeq,
        option_desc: optionDesc,
        is_correct: isCorrect,
      }
      valueArrOptions.push(value2);
    }
  }


  const arrQues = await Question.bulkCreate(valueArrQues);

  console.log(arrQues);

  let queslen = valueArrQues.length;
  let arrOption = valueArrOptions;
  let arrOptionlen = qoptionItem.length;
  let valueOption = [];
  let optionIndex = 0;
  for(let i  = 0; i < arrOptionlen ; i++){
    let questionId = arrQues[i].dataValues.question_id;
    for(let j = 0; j < qoptionItem[i]; j++){
      let value2 = {
        question_id : questionId,
        option_seq: arrOption[optionIndex].option_seq,
        option_desc: arrOption[optionIndex].option_desc,
        is_correct: arrOption[optionIndex].is_correct,
      }
      optionIndex ++;
      valueOption.push(value2);
    }
  }
  const arrOpti = QuestionOption.bulkCreate(valueOption);
  console.log(arrOpti);



  console.log(valueArrQues);
  console.log(valueArrOptions);
  console.log(valueOption);

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
var testExtra = async function () {
  let arrstr = await fstest();
  await RegTest(arrstr);
}

/**
 * 上传科学知识库
 * @returns {Promise<void>}
 */
var testScience = async function () {
  let arrstr = await fstest();
  await RegTest1(arrstr);
}


var RegTest1 = async function (arrstr) {
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

    let re1 = /[A-E]、|[A-E]\./;
    let arr1 = strarr[i].split(re1);

    let rrre = /\（\s*[A-E]\s*\）/
    let arr11 = arr1[0];
    let arrr11 = arr11.split(rrre);
    let arrr10 = arrr11[0]; //题目描述
    let arrr111 = /[A-Z]/; //答案
    let arrran = arr11.match(arrr111);

    let answer = arrran[0];
    let len11 = arr1.length - 1;
    let arr12 = [];
    console.log("题目" + index + arrr10);
    qoptionItem[index] = len11;
    index++;


    let qName = arrr10; //题目描述
    let qType = 998; // 0 单选题  1 多选题 2 判断题 3 填空题  999文化题 998 科学题
    let correctAnswer = letter2number(answer); //正确答案
    let qPoints = ''; //考点
    let explain = ''; //解析
    let value = {
      q_name: qName,
      q_type: qType,
      qbank_id: qbankId,
      priority: 100,
      qstatus: 1,
      correct_answer: correctAnswer,
      q_points: qPoints,
      explain: explain,
      option_amount: qoptionItem[index - 1]
    };
    valueArrQues.push(value);

    for (let j = 0; j < len11; j++) {
      arr12[j] = arr1[j + 1];
      console.log(arr12[j]);

      let optionSeq = j + 1 ; //选项出现的位置  选项ABCD可能颠倒位置
      let optionDesc = arr12[j]; //每个选项的描述
      let isCorrect = 0; // 0：错误 1：正确 代表这个选项是否是正确的   例： 1.正确答案是 B  ，而此选项代表A  则为0

      if (j + 1 === correctAnswer) {
        isCorrect = 1;
      }

      let value2 = {
        option_seq: optionSeq,
        option_desc: optionDesc,
        is_correct: isCorrect,
      }
      valueArrOptions.push(value2);
    }
  }


  console.log(valueArrQues);
  const arrQues = await Question.bulkCreate(valueArrQues);

  console.log(arrQues);

  let queslen = valueArrQues.length;
  let arrOption = valueArrOptions;
  let arrOptionlen = qoptionItem.length;
  let valueOption = [];
  let optionIndex = 0;
  for(let i  = 0; i < arrOptionlen ; i++){
    let questionId = arrQues[i].dataValues.question_id;
    for(let j = 0; j < qoptionItem[i]; j++){
      let value2 = {
        question_id : questionId,
        option_seq: arrOption[optionIndex].option_seq,
        option_desc: arrOption[optionIndex].option_desc,
        is_correct: arrOption[optionIndex].is_correct,
      }
      optionIndex ++;
      valueOption.push(value2);
    }
  }
  const arrOpti = QuestionOption.bulkCreate(valueOption);
  console.log(arrOpti);



  console.log(valueArrQues);
  console.log(valueArrOptions);
  console.log(valueOption);

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
  testExtra,
  testQbank,
  testScience,
  test1
}
