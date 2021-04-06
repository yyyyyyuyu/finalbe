const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question', {
    question_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    q_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "题目名称"
    },
    q_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目类型"
    },
    qbank_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题库ID"
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目优先级"
    },
    qstatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目状态"
    },
    correct_answer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "正确答案"
    },
    q_points: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "考点"
    },
    explain: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "解析"
    },
    option_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "有多少个选项"
    }
  }, {
    sequelize,
    tableName: 'question',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "question_id" },
        ]
      },
    ]
  });
};
