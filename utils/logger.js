// Sampling rate, 1.0 for all, 0.0 is none
const SAMPLE_RATE = 1.0;

const simpleLoggerInstance = {
  onEvent(evtId, evtName, content) {
    if (Math.random() > SAMPLE_RATE) {
      // skipping;
      console.warn('logger-not-uploading');
      return;
    }
    // 1. zipkin
    // 2. self-made API
    // 1. deviceInfo, userId, szuSessionId
    let ctx = { d:content };
    // Collect Info
    try {
      //if (evtId === logger.EVT_MAIN_ENTER) {
      let locationInfo = ''; //getApp().globalData.xboss.locationInfo;
      let systemInfo = ''; //getApp().globalData.xboss.systemInfo;
      let networkType = ''; //getApp().globalData.xboss.networkType;
      let breadcrumbs = ''; // getApp().globalData.xboss.breadcrumbs;
      ctx = {
        d: content, l: locationInfo, b: breadcrumbs, n: networkType, s:systemInfo
      };
      //}
    } catch (e) {
      console.warn("Error during logging" + e.toString());
    }
    // Setup userId
  }
};

const logger = {
  error(errMsg) {
    this.onError(this.events.EVTB_BACK_EXP, 'log.error', errMsg);
  },
  onError(evtId, evtName, err) {
    var tempErr = new Error();
    console.error('错误时间 : ' + new Date());
    console.error('错误内容 : ', err);
    console.error(tempErr.stack);
    console.log('错误时间 : ' + new Date());
    console.log('错误内容 : ', err);
    console.log(tempErr.stack);
    console.trace();
    simpleLoggerInstance.onEvent(this.events.EVTB_BACK_EXP, 'excpt.uncaught', err);
  },
  onKnownException(evtId, evtName, err) {
    console.error(evtName);
    console.trace('known.except' + evtName);
    simpleLoggerInstance.onEvent(this.events.EVTB_BACK_EXP, 'excpt.' + evtName, err);
  },
  onEvent(evtId, evtName, content) {
    // sampling
    try {
      const currentNow = new Date();
      console.log(' [' + evtName + ']  [' + evtId + ']  ['
        + currentNow.getHours() + ':' + currentNow.getMinutes() + '-' + currentNow.getSeconds() + ']');
      if (typeof content == "object") {
        console.log(JSON.stringify(content));
      } else {
        console.log(content);
      }
      simpleLoggerInstance.onEvent(evtId, evtName, content);
    } catch (e) {
      console.exception(e);
    }
  },
  getSzuSessionId() {
    const session = wx.getStorageSync('szuSessionId');
    if (session === undefined || session === null) {
      const szuSessionId = (Math.floor(Math.random() * 6553737) % 1379) + 'T' + new Date().getTime();
      wx.setStorageSync('szuSessionId', szuSessionId);
      return szuSessionId;
    } else {
      return session;
    }
  },
  debug() {
    console.log(arguments);
  },
  onLaunch() {
    const szuSessionId = (Math.floor(Math.random() * 6553737) % 1379) + 'T' + new Date().getTime();
    wx.setStorageSync('szuSessionId', szuSessionId);
  },
  log() {
    // Receive Arguments
    const args = Array.from(arguments);
    if (args.length > 0) {
      // report to jaeger;
      console.warn(arguments);
    } else {
      // report event
      console.warn('[Event] Console.log ');
    }
    logger.onEvent(this.events.EVTB_BACK_LOG, 'log', args);
  },

  events: {
    // Backend Itself
    EVTB_BACK_START: 100100,
    EVTB_BACK_EXP:100200,
    EVTB_BACK_BOOK:100300,
    EVTB_BACK_LOG: 100400,
    // LOGIN Based
    EVTB_USER_LOGIN:110000,
    EVTB_USER_FIRST_LOGIN:110100,
    // Upload Book
    EVTB_UPLOAD_BOOK: 120000,
    // Buy book
    EVTB_BUY_BOOK: 130000,
    // Share
    EVTB_LOOK_BOOKS: 140000,
    EVTB_CREATE_ORDER: 150000,
    EVTB_CANCEL_ORDER: 160000,
    // Messaging
    EVTB_SEND_MSG: 200000,
    // SMS
    EVTB_SEND_SMS_SUCCESS: 210000,
    EVTB_SEND_SMS_FAIL: 210100,
    EVTB_SEND_SMS_NO_SUCH_TEMPLATE: 210150,
    EVTB_SEND_SMS_START: 210200,
    EVTB_SEND_SMS_SOLD: 210300,
    // Sharing
    EVTB_SHARE_TRIGGERING: 300000,
    EVTB_SHARE_RELATION_ADDED: 300100,
    EVTB_SHARE_SAME_USER: 300200,
    // Payment
    EVTB_PAYMENT_GETORDER: 400001,
    EVTB_PAYMENT_GETORDER_SENT: 400002,
    EVTB_PAYMENT_NOTIFY: 400100,
    EVTB_PAYMENT_NOTIFY_BOOK_UPDATED: 400110,
    EVTB_PAYMENT_INCORRECT_CHARGE: 400300,
    EVTB_PAYMENT_EXCEPTIONAL_PROCESS: 400310,
    EVTB_PAYMENT_SUCCESS: 400500,
    EVTB_PAYMENT_WECHAT_FAILED: 400600,

    // Error
    EVTB_UNEXPECTED_EXCEPT: 800000,
    EVTB_UNEXPECTED_PATH: 800100,
    EVTB_UNEXPECTED_RANGE: 800200,
    EVTB_UNEXPECTED_CHAR: 800300,
    EVTB_USER_UPDATE_FAIL: 800400,
    EVTB_ORDER_FIND_FAIL: 800500,
    //MISSION
    EVTB_MISSION_SAVEBIND_FAIL: 900000,
    EVTB_MISSION_UPDATEBIND_FAIL: 900100,
    EVTB_MISSION_TRIGGER_FAIL: 900200,
    EVTB_USER_REWARD_FAIL: 900300,
    // Per Mission Type Error
    EVTB_MISSION_SHARE_RECEIVER_NOT_FOUND: 910000,
    // MISSION VISITATION
    EVTB_MIS_VISIT_BEFORE_ACTIVATOR: 920000,
    EVTB_MIS_VISIT_BEFORE_PROCEEDER: 920100,
    EVTB_MIS_VISIT_FINISH: 920200,
    EVTB_MIS_TRAVERSE_BEFORE: 921000,
    EVTB_MIS_TRAVERSE_FINISH: 921100,
    // Error Condition:
    EVTB_MISSING_USER_INTIVE_COUNT: 921200,
    EVTB_COMPLETABLE_MISSION_FAIL: 921300,
  }

};

module.exports = {
  logger
};
