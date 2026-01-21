const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Group = sequelize.define("Group", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: "groups",
  timestamps: true, // adds createdAt & updatedAt
});

module.exports = Group;
