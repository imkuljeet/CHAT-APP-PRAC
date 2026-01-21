const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");
const User = require("./users");
const Group = require("./groups");

const GroupMember = sequelize.define("GroupMember", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role: {
    type: DataTypes.ENUM("member", "admin"),
    defaultValue: "member",
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "group_members",
  timestamps: false, // we already have joinedAt
});

// Associations
User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

module.exports = GroupMember;
