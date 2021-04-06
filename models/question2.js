const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question2', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目ID"
    },
    fidName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "题目名称"
    },
    fidAnswer: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      comment: "题目答案"
    },
    fidType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目类型"
    },
    subjectType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "科目类型 0：数学，1：语文"
    },
    subjectUnit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "第几单元"
    },
    subjectGrade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "年级"
    },
    subjectTerm: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "学期"
    }
  }, {
    sequelize,
    tableName: 'question2',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
