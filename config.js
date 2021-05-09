
const baseUrl = {
  develop: 'http://127.0.0.1:3000', // 开发版
  // develop: 'https://localhost:8999', // 开发版
};

let imgUrl = "https://quizapp.oss-cn-shenzhen.aliyuncs.com/yugcdev/";






module.exports = {
  imgUrl,
  api: `${baseUrl["develop"]}/api/v1`,
  TRACER_SERVER: 'south.anitago.com',
  TRACER_PORT: 6832,
  TRACER_SERVICE_NAME: 'ygc-final-server',
  TRACER_SAMPLE_RATE: 1,
  SERVER_PREFIX: process.env.SMART_JAVA_SERVER ? process.env.SMART_JAVA_SERVER : "http://127.0.0.1:8080",
  secret: "ygc_yb",

};
