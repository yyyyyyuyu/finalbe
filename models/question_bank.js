const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question_bank', {
    qbank_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "题库名称"
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题库状态"
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "优先级"
    },
    subjectType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "科目类型 0：数学，1：语文"
    },
    subjectUnit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "共有几个单元"
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
    },
    extra1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    extra2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    textextra1: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'question_bank',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "qbank_id" },
        ]
      },
    ]
  });
};
