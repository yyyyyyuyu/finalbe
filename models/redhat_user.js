const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('redhat_user', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    nickName: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: ""
    },
    gender: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    birthday: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    last_login_time: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    last_login_ip: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_level_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    register_ip: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    openid: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 50
    },
    isAuthen: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    wechat: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    userType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    regionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'redhat_user',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "school_id",
        using: "BTREE",
        fields: [
          { name: "school_id" },
        ]
      },
      {
        name: "college_id",
        using: "BTREE",
        fields: [
          { name: "college_id" },
        ]
      },
    ]
  });
};
