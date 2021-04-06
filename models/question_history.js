const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question_history', {
    qhistory_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "练习题库的ID"
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "用户ID"
    },
    qhistory_name: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "题库名称"
    },
    qhistory_unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "第几单元"
    }
  }, {
    sequelize,
    tableName: 'question_history',
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
