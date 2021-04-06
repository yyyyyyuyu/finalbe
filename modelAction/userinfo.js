// User Mission Bind
var User =  require('../models/model').User;
const { logger } = require('../utils/logger');


/**
 * 保存用户token及 各种信息
 * @param userId
 * @param code
 */
const saveUserInfo = (userId, code) => {
  if (typeof userId != "number" ) {
    logger.onError(logger.events.EVTB_UNEXPECTED_EXCEPT, 'unexpect.user.data', {
      userId,
    });
    throw "saveData given no number on userId or dataKey";
  }
  let pre = User.create({
    userId,
    addTime: new Date(),
    token: code
  }).then((results) => {
    return results;
  });
}

/**
 * 更新token
 * @param userId
 * @param code
 * @returns {Promise<void>}
 */
const updateUserInfo =  async (userId, code ) => {
  let result =await User.update({
    addTime: new Date(),
    token: code
  }, { where : { userId} }).then((results) => {
    return results;
  });
}

module.exports = {
  saveUserInfo,
  updateUserInfo
}
