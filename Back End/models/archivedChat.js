// models/archivedChat.js
const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const ArchivedChat = sequelize.define(
  "ArchivedChat",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    GroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "archived_chats",
    timestamps: true, // keeps createdAt & updatedAt
  }
);

module.exports = ArchivedChat;
