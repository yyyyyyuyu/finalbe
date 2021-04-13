

var question = require('../routes/getQuestion')
var qhistory = require('../routes/questioHistory')
var config =require('../config')
var util = require('../utils/utils');
var requests = require('request')


var testQuest = function (){
  let qinfo = {
    subType : 0,
    subGrade : 4,
    subTerm : 0,
  }
  let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7Im9wZW5pZCI6Im9SUnJyNVN0YWdpbG41dnFDc2RUMzNfcF84QlUiLCJpZCI6Mn0sImlhdCI6MTYxNzI5NTY3NiwiZXhwIjoxNjE3OTAwNDc2fQ.J942VO0W6EGOzRXyFBBA7L4OV8mhVqSbPsb3RQf0dTc";

  question.getQuestionItem({
    qinfo,
    token
  });
}
var test = function (){
  let a= "12";
  console.log( typeof a);
  let b = parseInt(a);
  console.log( typeof b);
}
var testGetHistory = function (){
  let url = config.api + '/course/History';
  let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7Im9wZW5pZCI6Im9SUnJyNVN0YWdpbG41dnFDc2RUMzNfcF84QlUiLCJpZCI6Mn0sImlhdCI6MTYxNzI5NTY3NiwiZXhwIjoxNjE3OTAwNDc2fQ.J942VO0W6EGOzRXyFBBA7L4OV8mhVqSbPsb3RQf0dTc";
  requests.get(url,{data:{token}},function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      var data = JSON.parse(body);
      let openid = data.openid;
      token  = util.generateToken(openid,1);
      console.log(data);
      console.log(data.openid);
    } else {
      console.error(error);
    }
  })
}

module.exports ={
  testQuest,
  test,
  testGetHistory
}
