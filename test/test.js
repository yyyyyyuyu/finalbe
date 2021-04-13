var assert = require('assert');
const creatMysql = require('./testCreatMysql');
const getQues = require('./testGetQues');
const CreateExtra = require('./testCreateExtra');
const CreatePoetry = require('./testCreatePoetry');

describe('#testCreatMysql.js', function() {
  describe('function()', function () {
    it('should return 0', async function () {
      await creatMysql.testfinal();
    });
    it('should return 1', async function () {
      await creatMysql.test();
    });
    it('should return 4', async function () {
      await creatMysql.testQbank();
    });
    it('should return 2', async function () {
      await getQues.testQuest();
    });
    it('should return 3', async function () {
      await getQues.test();
    });
    it('should return 5', async function () {
      await getQues.testGetHistory();
    });
    it('should return 7', async function () {
      await CreateExtra.testScience();
    });
    it('should return 8', async function () {
      await CreateExtra.test1();
    });
    it('should return 9', async function () {
      await CreatePoetry.testPoetry();
    });
  });
});
