const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question_option', {
    option_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    option_seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "选项出现的位置"
    },
    option_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "选项1的描述"
    },
    is_correct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "这个选项是否正确"
    },
    chosen_times: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "选择次数"
    },
    correct_times: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "正确率"
    }
  }, {
    sequelize,
    tableName: 'question_option',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "option_id" },
        ]
      },
    ]
  });
};
