const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('poetry_bank', {
    pbank_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "古诗题库id"
    },
    pname: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    edition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "教育版本 例如：人教版=0，部编版=1"
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
    tableName: 'poetry_bank',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pbank_id" },
        ]
      },
    ]
  });
};
