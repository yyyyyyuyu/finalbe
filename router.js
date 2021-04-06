var express = require('express');
var middlewares = require('./middleWares/check')
var router = express.Router();

var User = require("./routes/index");
var login = require('./routes/login');
var users  = require('./routes/users');
var question = require('./routes/getQuestion')
var qhistory = require('./routes/questioHistory')

//router.get('/users/id',User.getUserName); //发送信息
router.route('/users/id').get(middlewares.checkToken, users.getUser)  //获取某个用户信息 index页
  .put(middlewares.checkToken, users.modifyUser);  //认证user   authen页

router.post('/login/updateUserInfo', middlewares.checkToken, login.updateUserInfo); //认证之后更新信息
router.get('/login/isAuthenSuc', middlewares.checkToken, login.isAuthenSuc); //是否认证

// router.get('/users/id', function(req, res, next) {
//   res.send('respond with a resource');
// });
router.post('/onLogin', login.onLogin); //登录  index页
router.post('/verifyLogin', login.verifyLogin); //验证登录  index页


router.get('/course/Detail', question.getQuestionItem);

router.post('/course/History',middlewares.checkToken, qhistory.postHistory);


module.exports = router;
