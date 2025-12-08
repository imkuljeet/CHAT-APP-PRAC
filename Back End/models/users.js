const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("User", {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: "users",
  timestamps: true, // adds createdAt & updatedAt
});

module.exports = User;
