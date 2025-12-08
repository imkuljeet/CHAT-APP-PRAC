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

// Associations
User.hasMany(Message);       // one user can send many messages
Message.belongsTo(User);     // each message belongs to a single user

module.exports = Message;
