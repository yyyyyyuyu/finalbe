const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question_history_item', {
    qhistory_item_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "练习题目的ID"
    },
    qhistory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "练习题库的ID"
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "题目ID"
    },
    is_answer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "回答的答案"
    },
    is_correct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "是否正确"
    },
    chosen_times: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "练习过此题的次数"
    }
  }, {
    sequelize,
    tableName: 'question_history_item',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "qhistory_item_id" },
        ]
      },
    ]
  });
};
