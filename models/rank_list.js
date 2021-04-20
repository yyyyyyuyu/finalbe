const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rank_list', {
    rank_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "用户ID"
    },
    subjectType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "科目类型"
    },
    correct_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "答对题目数量"
    },
    extra1: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    extra2: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'rank_list',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rank_id" },
        ]
      },
    ]
  });
};
