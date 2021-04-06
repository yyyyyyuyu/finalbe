const jwt = require("jsonwebtoken");
const cert = require("../config").secret;
var request = require('request');

/**
 * 生成token
 * @param code
 * @param id
 * @returns {*}
 */
function generateToken( code, id ) {
  return jwt.sign(
    {
      // token数据
      openid:code,
      id: id
    },
    cert, // 密钥
    {
      //参数 options
      algorithm: "HS256", // 加密算法   对称加密算法
      issuer: "ygc", // 签发人
      expiresIn: '7 days' , // 过期时间
    }
  );
}





/**
 * 签名验证
 * @param {string} token
 */
function verifyToken(token) {
  try {
    return new Promise((resolve, reject) => {
      jwt.verify(token, cert, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    })
  } catch (error) {
    return {
      code: 10000,
      message: error.message,
    };
  }
}

/**
 *
 * get 请求
 * @param url
 * @returns {Promise<unknown>}
 */

function httpGetJson( url ){
  return new Promise((resolve, reject) => {
    request(url, {} ,function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        var data = JSON.parse(body);
        resolve(data);
      } else {
        console.error(error);
        reject({ error, response, body});
      }
    });
  })
}

exports.decode = function (code, callback) {
  jwt.verify(code, cert, callback);
};


exports.getToken = (req) => {
  let token = req.query.token || req.body.token || req.get('token');
  return token;
};


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

const num2term = function (num){
  let name ;
  switch (num){
    case 0:
      name = '一年级上册';
      break;
    case 1:
      name = '一年级下册';
      break;
    case 2:
      name = '二年级上册';
      break;
    case 3:
      name = '二年级下册';
      break;
    case 4:
      name = '三年级上册';
      break;
    case 5:
      name = '三年级下册';
      break;
    case 6:
      name = '四年级上册';
      break;
    case 7:
      name = '四年级下册';
      break;
    case 8:
      name = '五年级上册';
      break;
    case 9:
      name = '五年级下册';
      break;
    case 10:
      name = '六年级上册';
      break;
    case 11:
      name = '六年级下册';
      break;
    default:
      name = '一年级上册';
      break;
  }
  return name;
}

const randomSelection = function (questionAll, subUnits){
  let len =questionAll.length;
  let subGroupNum = Math.floor(len / subUnits);
  let subGroup = 5;
  let offset = len % subUnits;
  var questionArr = new Array();
  let index = 0;
  for(let i =0; i< subUnits ; i++){
    questionArr[i] = new Array();
  }
  for(let i =0; i < len ; i++){
    if(index == subUnits) break;
    questionArr[index].push(questionAll[i]);
    if( (i+1) % subGroupNum == 0 && i!=0){
      index ++;
    }
  }
  let index1 = 0;
  let offset1 = len -offset;
  for(let i =0;i < subUnits ; i++){
    if( (i+1) % 2 ==0 && i!=0){
      offset1 = len-offset;
    }
    questionArr[i].push(questionAll[offset1]);
    offset1++ ;
  }

  let arr1  = new Array();
  for(let i =0;i<subUnits;i++){
    arr1[i] =new Array();
  }
  for(let i =0; i< subUnits ;i++){
    let arrQuestion = shuffle(questionArr[i]);
    arr1[i] = arrQuestion;
  }
  let arr2  = new Array();

  for(let i =0; i< subUnits ;i++){
    let arrtest = arr1[i].slice(0,subGroup);
    arr2.push(arrtest);
  }
  console.log(arr2);
  return arr2;

}


function shuffle(arr){
  var result = [],
    random;
  while(arr.length>0){
    random = Math.floor(Math.random() * arr.length);
    result.push(arr[random])
    arr.splice(random, 1)
  }
  return result;
}



exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.httpGetJson = httpGetJson;
exports.num2subject = num2subject;
exports.num2term = num2term;
exports.randomSelection = randomSelection;

