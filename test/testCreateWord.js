var User = require('../models/model').User;
var Question = require('../models/model').Question;
var QuestionBank = require('../models/model').QuestionBank;
var QuestionOption = require('../models/model').QuestionOption;
var Poetry = require('../models/model').Poetry
const util = require("../utils/utils");
var   {parse}  = require('node-html-parser');
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
const iconv = require("iconv-lite");

var word2html = function (){
  var path = require('path');
  var word2html = require('word-to-html');
//Word document's absolute path
  var absPath = path.join('D://NodeJs/finalServer/word','1.docx');
  word2html(absPath,{tdVerticalAlign:'top'})
}

var testWord2Html =function (){
  word2html();
}


const fs = require('fs');
const readline = require('readline');
const fidName = "./word/6.htm";
var qbankId = 30; //几年级几学期  1-12 语文 13-24 数学 25-36 英语




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

  console.log(arrstr);
  console.assert(!(!arrstr));
  let re = /\d+\. \( [0-9]分 \)/;
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
    let re1 = /【答案】/;
    let arr1 = strarr[i].split(re1);
    let re2 = /【考点】/;
    let arr2 = arr1[1].split(re2);
    let re3 = /【解析】/;
    let arr3 = arr2[1].split(re3);

    let re10 = /\（[0-9]\）/;
    let arr110 = arr1[0].split(re10);
    let len110 = arr110.length;
    if (len110 > 1) {
      continue;
    }

    let re11 = /[A-Z]\./;
    let arr11 = arr1[0].split(re11);
    let arr10 = arr11[0];
    let len11 = arr11.length - 1;
    let arr12 = [];
    console.log("题目" + index + arr11[0]);
    qoptionItem[index] = len11;
    index++;

    console.log("答案" + arr2[0]);
    console.log("考点:" + arr3[0]);
    console.log("解析" + arr3[1]);

    let qName = arr11[0]; //题目描述
    let qType = 0; // 0 单选题  1 多选题 2 判断题 3 填空题
    let correctAnswer = letter2number(arr2[0].trim()); //正确答案
    let qPoints = arr3[0]; //考点
    let explain = arr3[1]; //解析
    /*    let questionId = '' + qbankId + '' + PrefixZero(index, 5); //题目ID
        Number(questionId);*/

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
      arr12[j] = arr11[j + 1];
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
  /*  for(let i =0;i<queslen;i++){
      let questionId = arrQues[i].dataValues.question_id;
      for(let j =0 ;j < arrOptionlen; j++){
        let value2 = {
          question_id : questionId,
          option_seq: arrOption[j].option_seq,
          option_desc: arrOption[j].option_desc,
          is_correct: arrOption[j].is_correct,
        }
        valueOption.push(value2);
      }
    }*/

  const arrOpti = QuestionOption.bulkCreate(valueOption);
  console.log(arrOpti);



  console.log(valueArrQues);
  console.log(valueArrOptions);
  console.log(valueOption);

  /*    for (let i of strarr){
          console.log(i);
      }*/
}











var parseHtml = async function (arrstr){
  console.log(arrstr);
  let filename = fidName.replace(/\.\/word\//,"doc");
  filename = filename.replace(/\.htm/,"");

/*  const $ = cheerio.load(arrstr);
  $.root().html();
  console.log($.root().html());*/
  const root = parse(arrstr);

  let test = root.firstChild.structure;
 // console.log(root.firstChild.structure);
  let headAll = root.childNodes;
  let head = headAll[0];
  let bodyAll = head.childNodes;
  let body = bodyAll[3];
  let divAll = body.childNodes;
  let div = divAll[1];
  let alldata = div.childNodes;
  console.log(alldata);

  const len = alldata.length;

  let currentQuestion = [];
  let questionIndex = 0;

  for(let i =0;i<len;i++){
    const currentData = alldata[i];
    let rawAtts = currentData.rawAttrs;
    let reraw = "margin-bottom:0cm";
    let rawTagName = currentData.rawTagName;
    let rerawTag = "p";

    if(rawAtts && rawAtts.includes(reraw) && rawTagName == rerawTag){    // 判断是否为试题题目信息

      let spanAll = currentData.childNodes;
      if(spanAll.length <3) continue;
      let span1 = spanAll[0].firstChild.rawText;
      let span3 = spanAll[2].firstChild.rawText;
      let re1 = /\d+\. \( [0-9]/;
      let re3 = /\)/;
      let result1 = span1.match(re1);
      let result2 = span3.match(re3);
      if(result1 && result2){ //判断 成功
        let currentImg;
        let currentName;
        currentQuestion[questionIndex] = i;
        questionIndex ++;

/*        if(spanAll[3]){ //判断试题题目中是否只包含图片
          let span4 = spanAll[3].firstChild.rawAttrs;
          let re4 = /src=/;
          let result3 = span4.split(re4);
          currentName = result3[1]; //切割后 读取图片
        }
        else{  //试题题目中未包含图片
          let result3 = span3.split(re3);
          currentName = result3[1]; //读取试题题目信息
        }*/
      }
    }
  }

  let indexFlag = -1;//初始化试题数组的下标
  let valueArrQues = []; // 问题描述
  let valueArrOptions = []  //选项描述
  let qType = 0; // 0 单选题  1 多选题 2 判断题 3 填空题

  console.log(">>>>/???");
  for(let i =0;i<questionIndex-1;i++){
    let currentIndex =  currentQuestion[i];
    let nextIndex  = currentQuestion[i+1];

    let qName ;
    let qType = 0; // 0 单选题  1 多选题 2 判断题 3 填空题
    let correctAnswer;
    let qPoints;
    let explain;
    let optionAll = [];
    let optionLength;
    for(let j = currentIndex;j<nextIndex;j++){
      let currentData = alldata[j];

      // 判断是否为试题题目信息
      let rawAtts = currentData.rawAttrs;
      let reraw = "margin-bottom:0cm";
      let rawTagName = currentData.rawTagName;
      let rerawTag = "p";

      if(rawAtts && rawAtts.includes(reraw) && rawTagName == rerawTag && currentData.childNodes.length >=3){    // 判断是否为试题题目信息
        let spanAll = currentData.childNodes;

        let span1 = spanAll[0].firstChild.rawText;
        let span3 = spanAll[2].firstChild.rawText;
        let re1 = /\d+\. \( [0-9]/;
        let re3 = /\)/;
        let result1 = span1.match(re1);
        let result2 = span3.match(re3);
        let resulttt = span3.split(re3);
        if(result1 && result2){ //判断 成功
          let currentImg;
          let currentName;
          let re5 = /src=/;
          let re12 = /font-family/;
          if(spanAll[3] && spanAll[3].firstChild.rawAttrs && spanAll[3].firstChild.rawAttrs.match(re5)){ //判断试题题目中是否只包含图片
            let span4 = spanAll[3].firstChild.rawAttrs;
            let re4 = /src=/;
            let result3 = span4.split(re4);
            let resultt = result3[1].replace(/&nbsp;/ig, "");
            let ree = /alt=/;
            if(resultt.match(ree)){
              let  resultt1 = resultt.split(ree);
              resultt = resultt1[0];
            }
            resultt = resultt.replace(/&nbsp;/ig, "");
            resultt = resultt.replace(/\d+\.files/,filename);
            currentName = resultt; //切割后 读取图片
          }
          else if(spanAll[3] && spanAll[3].rawAttrs && spanAll[3].rawAttrs.match(re12) && spanAll[3].childNodes.length >=1){ //题目中含有中文
            if(resulttt[1] && resulttt[1].trim()){
              let result3 = span3.split(re3);
              let resultt = result3[1].replace(/&nbsp;/ig, "");
              currentName = resultt; //读取试题题目信息
            }
            else{
              let result3 = spanAll[3].firstChild.rawText;
              let resultt = result3.replace(/&nbsp;/ig, "");
              let endWith;
              if(resultt.length -1 >= 0){
                endWith = resultt[resultt.length-1];
              }
              if(endWith == "（"){
                resultt = resultt + "   ）";
              }
              currentName = resultt; //读取试题题目信息
            }
          }
          else{  //试题题目中未包含图片
            let blankindex = 0;
            let extraQName = "";
            if(spanAll[2].childNodes.length >1){
              for(let tt=1;tt < spanAll[2].childNodes.length; tt++){
                if(spanAll[2].childNodes[tt].rawTagName == 'u'){
                  blankindex = tt;
                }
                else{
                  if(spanAll[2].childNodes[tt].rawText){
                    extraQName = extraQName + spanAll[2].childNodes[tt].rawText;
                  }
                }
              }
            }
            let midQname = "";
            if(blankindex !=0){
              midQname = "________";
            }
            let result3 = span3.split(re3);
            let resultt = result3[1].replace(/&nbsp;/ig, "");
            if(extraQName || midQname){
              resultt = resultt + midQname + extraQName;
            }
            resultt = resultt.replace(/&nbsp;/ig, "");
            currentName = resultt; //读取试题题目信息
          }
          qName = currentName;
          continue;
        }
      }


      //判断是否为题目的选项
      let reraw1 = "margin-top:0cm;margin-right:0cm;";
      let rawTagName1 = currentData.rawTagName;
      let rerawTag1 = "p";
      let optionFlag = 0;
      if(rawAtts && rawAtts.includes(reraw1) && rawTagName1 == rerawTag1){
        let spanAll = currentData.childNodes;
        if(spanAll.length ==1) {optionFlag = 1}
        let currentSpan ;
        let rerawOption = "color:black";
        let optionIndex = 0;
        let itemFlag = 0;
        if(optionFlag == 1){
          currentSpan = spanAll[0];
          let re1 = /[A-Z]\./;
          let span1 = currentSpan.firstChild.rawText;
          span1 = span1.replace(/&nbsp;/ig, "");
          let result1 = span1.split(re1); //进行切割选项
          for(let kk = 1;kk < result1.length;kk++){
            optionAll[optionIndex] = result1[kk];
            optionIndex ++;
          }
        }
        else {
          for(let k =0;k<spanAll.length;k++){
            //切割选项
            currentSpan = spanAll[k];
            let re1 = /[A-Z]\./;
            let span1 = currentSpan.firstChild.rawText;
            span1 = span1.replace(/&nbsp;/ig, "");
            let result1 = span1.split(re1); //进行切割选项
            let span12;
            if(spanAll[k+1]){
              span12 = spanAll[k+1].rawAttrs;
            }
            let re12 = /font-family/;
            if(result1.length >1 && result1[1]){ //说明选项中不包含图片
              let resultt = result1[1].replace(/&nbsp;/ig, "");
              optionAll[optionIndex] = resultt;
              optionIndex ++;
            }
            else if(result1.length >1 && span12 && span12.match(re12)){ //说明选项中不包含图片 并且选项为中文
              let span2 = spanAll[k+1].firstChild.rawText;
              let resultt = span2.replace(/&nbsp;/ig, "");
              optionAll[optionIndex] = resultt;
              optionIndex ++;
            }
            else if(result1.length > 1 && span1.match(re1) && !result1[1]){
              let span2 = spanAll[k+1].firstChild.rawAttrs;
              let re4 = /src=/;
              let result3 = span2.split(re4);
              let resultt = result3[1].replace(/&nbsp;/ig, "");
              let ree = /alt=/;
              if(resultt.match(ree)){
                let  resultt1 = resultt.split(ree);
                resultt = resultt1[0];
              }
              resultt = resultt.replace(/&nbsp;/ig, "");
              resultt = resultt.replace(/\d+\.files/,filename);
              optionAll[optionIndex] = resultt; //切割后 读取图片
              optionIndex++;
            }
          }
        }
        optionLength = optionIndex;
        continue;
      }

      let qanswer ;

      //判断是否答案
      if(rawAtts && rawAtts.includes(reraw) && rawTagName == rerawTag){    // 判断是否为试题题目信息
        let spanAll = currentData.childNodes;
        let span1 = spanAll[0].firstChild.rawText;
        let re1 = /【答案】/;
        let result1 = span1.match(re1);
        if(result1){
          qanswer = spanAll[1].firstChild.rawText;
          let resultt = qanswer.replace(/&nbsp;/ig, "");

          correctAnswer =resultt;
        }
        let re2 = /【考点】/;
        let result2 = span1.match(re2);
        if(result2){
          let resultt = spanAll[1].firstChild.rawText.replace(/&nbsp;/ig, "");

          qPoints = resultt;
        }
        let re3 = /【解析】/;
        let result3 = span1.match(re3);
        if(result3){
          let explainlength = spanAll.length -1;
          let explainAll=[] ;
          for(let t=1;t<= explainlength;t++){
            let currentText = spanAll[t].firstChild.rawText;
            explainAll.push(currentText);
          }
          explain = explainAll.join('');
          let resultt = explain.replace(/&nbsp;/ig, "");
          explain = resultt;
        }
      }

    }

    correctAnswer = letter2number(correctAnswer.trim()); //正确答案

    let value = {
      q_name: qName,
      q_type: qType,
      qbank_id: qbankId,
      priority: 100,
      qstatus: 1,
      correct_answer: correctAnswer,
      q_points: qPoints,
      explain: explain,
      option_amount: optionLength
    }
    valueArrQues.push(value);
    for(let k = 0 ;k<optionLength;k ++){
      let optionSeq = k + 1 ; //选项出现的位置  选项ABCD可能颠倒位置
      let optionDesc = optionAll[k]; //每个选项的描述
      let isCorrect = 0; // 0：错误 1：正确 代表这个选项是否是正确的   例： 1.正确答案是 B  ，而此选项代表A  则为0

      if (k + 1 === correctAnswer) {
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
  console.log(valueArrOptions);

  const arrQues = await Question.bulkCreate(valueArrQues);

  console.log(arrQues);

  let queslen = valueArrQues.length;
  let arrOption = valueArrOptions;
  let qoptionItem = valueArrQues.map(function (value, index, array) {
    return value.option_amount;
  })
  let arrOptionlen = valueArrQues.length;
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


  console.log(test);

}

var testParseHtml = async function (){
  //let arrstr = await fstest();
  let arrstr;
  fs.readFile(fidName,  async (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(data);
    data = iconv.decode(data,'gbk');
    arrstr = data;
    await parseHtml(arrstr);
  })

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

module.exports = {
  testWord2Html,
  testParseHtml
}
