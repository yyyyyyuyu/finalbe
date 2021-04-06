var util = require('../utils/utils');
var User = require('../models/model').User;
const http = require('../utils/http');

exports.getUser = function (req, res) {
  var token = req.query.token;
  let userInfo;
  util.verifyToken(token).then((decoded) => {
    let payload = decoded.payload;
    return User.findOne({
      where: { id: payload.id },
      attributes : ["address", "avatar_url", "gender", "id", "isAuthen", "nickName"]
    });
  }).then((user) => {
    if (user) {
      userInfo = user.dataValues;
      res.status(http.STATUS_OK).json(userInfo);
    } else {
      throw new Error({error: '用户信息不存在'});
    }
  }).catch(exp => {
    console.log("Error in users.js:getUser, exp : ", exp);
    res.status(http.STATUS_INTERN_SERVER_ERR).json({error: '用户信息处理错误'});
  })
};

//认证信息
exports.modifyUser = function (req, res) {
  var userInfo = req.body.userInfo,
    token = req.body.token;
  console.log(token, userInfo);
  //验证信息完整性
  for (key in userInfo) {
    if (userInfo[key] == null || userInfo[key] == undefined) {
      res.status(422).json({error: '信息不完整'});
    }
  }

  util.decode(token, (err, decoded) => {
    payload = decoded.payload;
    User.update({
      name: userInfo.name,
      school_id: userInfo.school_id,
      college_id: userInfo.college_id,
      address: userInfo.address,
      phone: userInfo.phone,
      wechat: userInfo.wechat,
      isAuthen: 1,
      regionId:userInfo.regionId
    }, {
      where: {id: payload.id}
    }).then((data) => {
      // console.log(data.dataValues);
      res.status(http.STATUS_OK).json({message: '认证成功'});
    })
  })
};
