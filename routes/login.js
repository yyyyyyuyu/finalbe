var jwt = require('jsonwebtoken');
var util = require('../utils/utils');
var config = require('../config');
var UserInfo = require('../modelAction/userinfo');
var { logger } = require('../utils/logger');
const http = require('../utils/http');
var User = require('../models/model').User;

let global_code_cache = {};

exports.onLogin = function (req, res) {
  var code = req.body.code;
  var userInfo = req.body.userInfo;
  // console.log(code, userInfo);
  let openid;
  let userId = 0;
  let validToken;
  let validUserDetail;
  let attributes = ["address", "avatar_url", "gender", "id", "isAuthen", "nickName"];
  let userInfoDetail = {};

  let url = 'http://127.0.0.1:8080/wx/user/wxb93d7c554a9a5833/login?code=' + code;

  util.httpGetJson(url).then((data) => {
    if (!data || !data.openid || !data.openid) {
      console.warn("无法获取用户的 openid, 请检查");
      console.warn(data);
      throw new Error('Cannot get openId from wechat server');
    }
    console.log({msg: "wx_login_success", code, openid});
    openid = data.openid;
    global_code_cache["" + code] = openid;
    return openid;
  }).then((openIdValue) => {
    //查找用户是否存在
    return User.findOne({ where: { openid } });
  }).then((result) => {
    // 用户不存在则创建
    if (!result && userInfo) {
      return User.create({
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        nickName: userInfo.nickName,
        openid: openid,
        balance: 50, // 创建用户时送1换换币
        weight: 100
      });
      //用户不存在，且没有userInfo信息
    } else if (!result && !userInfo) {
      // user unregistered, with no input info.
      console.log('no userInfo present : ' + openid);
      return User.create({
        avatar_url: 'aabc',
        gender: 1,
        nickName: '换友',
        openid: openid,
        balance: 50, // 创建用户时送1换换币
        weight: 100
      });
    } else {
      // 用户存在的处理
      console.log('updating with userInfo present : ' + openid);
      validUserDetail = result;
      let user = result.dataValues;
      if (userInfo) {
        userId = user.id;
        return User.update({
          avatar_url: userInfo.avatarUrl,
          gender: userInfo.gender,
          nickName: userInfo.nickName
        }, {
          where: { id: user.id }
        });
      }
      return result;
    }
  }).then(userData => {
    let user = userData.dataValues;
    if (!userData || !user) {
      throw new Error("cannot find/create user entry");
    }
    //生成token 返回
    let token = jwt.sign({
      payload: {
        openid,
        id: user.id
      }
    }, config.secret, { expiresIn: '7 days' });
    userId = user.id;
    if (typeof userId == "string") {
      userId = parseInt(userId);
    }
    validToken = token;
    validUserDetail = user;
    for (let i in attributes) {
      userInfoDetail[attributes[i]] = validUserDetail[attributes[i]];
    }
    // intended not to interrupt the login flow when this line fails,
    // 不需要 return 下面的 Promise
    User.update({ token }, {  where: { id: user.id } });
  }).then((userUpdateRes) => {
    return {
      token: validToken,
      userInfoDetail: userInfoDetail
    };
  })
    .then((info) => res.json(info))
    .catch((err) => {
      console.error(err);
      if (validUserDetail && validToken) {
        res.json({
          token: validToken,
          userInfoDetail
        });
      } else if (userInfoDetail && validToken) {
        res.json({
          token: validToken,
          userInfoDetail
        });
      } else if (validToken) {
        res.json({
          token: validToken,
          userInfoDetail : {}
        });
      } else {
        console.log("UNEXCEPTED LOGIN FAILURE, NEED EXAMINE: " + new Date());
        res.status(http.STATUS_INTERN_SERVER_ERR)
          .json({error: 'login failure, this is critical'});
      }
    })
    .catch(exp => {
    console.log(exp);
    console.error("unexpected POST-LOGIN Failure, need closer examination: " + new Date());
  });
};


exports.updateUserInfo = function(req, response) {
  var userInfo = req.body.userInfo;
  let token = util.getToken(req);
  let userInfoDetail;
  util.verifyToken(token).then((decoded) => {
    let payload = decoded.payload;
    return User.findOne({
      where: { id: payload.id },
      attributes : ["address", "avatar_url", "gender", "id", "isAuthen", "nickName"]
    });
  }).then((findRes) => {
    let user = findRes.dataValues;
    userInfoDetail = findRes.dataValues;
    if (userInfo ) {
      let userId = user.id;
      if (typeof userInfo == 'string') {
        userInfo = JSON.parse(userInfo);
      }
      userInfoDetail.avatar_url = userInfo.avatarUrl;
      userInfoDetail.gender = userInfo.gender;
      userInfoDetail.nickName = userInfo.nickName;
      return User.update({
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        nickName: userInfo.nickName,
        isAuthen: 1
      }, {
        where: { id: user.id }
      });
    } else {
      throw new Error({ error: '用户信息不存在'});
    }
  }).then(saveRes => {
    response.json({isAuthen : 1});
  }).catch(err => {
    console.error(err);
    logger.onEvent(logger.events.EVTB_BACK_EXP, 'be.login.update.fail', {token, userInfo});
    response.status(500).json({status: 'fail', reason: err});
  })
}

exports.isAuthenSuc = function (req, res){
  let token = util.getToken(req);
  console.log(token);
  util.verifyToken(token).then((decoded) => {
    let payload = decoded.payload;
    return User.findOne({
      where: { id: payload.id },
      attributes : ["address", "avatar_url", "gender", "id", "isAuthen", "nickName"]
    });
  }).then(findRes => {
    let user = findRes.dataValues;
    res.json({ isAuthen : user.isAuthen});
  })
}


exports.verifyLogin = function (req, res) {
  var token = req.get('token');
  console.log("token: " + token);
  if (token === undefined || token.length === 0) {
    res.status(http.STATUS_UNAUTHORIZED)
      .json({error: 'empty token'});
  } else {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        //验证失败 重新登录
        console.log(err);
        res.status(http.STATUS_UNAUTHORIZED)
          .json({error: 'token过期'})
      } else {
        console.log("decode token: " + decoded);
        User.update({ token }, {
          where: {id: decoded.payload.id}
        }).then((updateRes) => {
        });
        res.status(http.STATUS_OK)
          .json({message: '登录成功'})
      }
    });
  }
};
