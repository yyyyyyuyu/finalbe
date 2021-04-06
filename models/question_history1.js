const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question_history1', {
    qhistory_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_correct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "是否正确"
    },
    exam_trace_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "第几次练习过这道题目"
    }
  }, {
    sequelize,
    tableName: 'question_history1',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "qhistory_id" },
        ]
      },
    ]
  });
};
