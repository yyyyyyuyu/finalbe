const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question_history_item2', {
    history_item_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    history_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "练习题目的ID"
    },
    is_answer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "回答的答案"
    }
  }, {
    sequelize,
    tableName: 'question_history_item2',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "history_item_id" },
        ]
      },
    ]
  });
};
