const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('poetry', {
    poetry_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "古诗id"
    },
    poetry_name: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "古诗名字"
    },
    poetry_author: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "古诗作者"
    },
    poetry_notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "注释"
    },
    poetry_major: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "古诗主体"
    },
    poetry_translation: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "译诗"
    },
    poetry_appreciation: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "赏析"
    },
    pbank_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "古诗题库id"
    },
    extra: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "古诗主体"
    }
  }, {
    sequelize,
    tableName: 'poetry',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "poetry_id" },
        ]
      },
    ]
  });
};
