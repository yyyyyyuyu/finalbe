var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('../utils/utils');
/*
var User =require('../models/model').User;

let user = User.findAll();
console.log(user);
*/
/*
var initModels = require("../models/init-models");
var sequelize  = require("../models/index").sequelize;
var models = initModels(sequelize);
*/

var User = require("../models/model").User;
let userdata ;
let user;
let UserData = User.findAll().then(data => {
  console.log(data);
  userdata = data[0].dataValues;
  user = userdata.name;
})
/*
let UserData = models.redhat_user.findAll().then(data => {
  console.log(data);
  userdata = data[0].dataValues;
  user = userdata.name;
})
*/


/* GET home page. */
// router.get('/', function(req, res, next) {
//   //res.render('index', { title: user });
//   res.json(user);
// });

exports.getUserName = function (req, res) {

  console.log(req.query);
  console.log(req.query.code);
  let code = req.query.code;

  let url = 'http://127.0.0.1:8080/wx/user/wxb93d7c554a9a5833/login?code=' + code;
  util.httpGetJson(url).then((data) => {
    console.log(data);
    let openid = data.openid;
    let token = util.generateToken(openid , 1);
    console.log(token);
    res.json({
      user: user,
      code: code,
      token: token,
    })
  })
/*  request(url, {} ,function (error, response, body) {
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
  });*/

}


//module.exports = router;
