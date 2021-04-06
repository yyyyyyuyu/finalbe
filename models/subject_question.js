const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subject_question', {
    questionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "题目ID"
    },
    fldName: {
      type: DataTypes.STRING(40),
      allowNull: false,
      comment: "题目名称"
    },
    fldAnswer: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      comment: "题目答案，可以预设。单选：值为单个数字 ；多选：字符串，以逗号分隔，如\"1,2,3\"；多选为字符串"
    },
    questionType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目类型，0为单选题，1为多选，2为填空"
    },
    QuestionOptionList: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "单选或者多选时的选项"
    },
    subjectType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "科目类型"
    },
    subjectGrade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "年级"
    },
    subjectUnit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "单元"
    }
  }, {
    sequelize,
    tableName: 'subject_question',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "questionID" },
        ]
      },
    ]
  });
};
