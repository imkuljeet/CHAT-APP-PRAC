const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");
const User = require("./users"); // assuming you already have a User model

const Message = sequelize.define(
  "Message",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = Message;
