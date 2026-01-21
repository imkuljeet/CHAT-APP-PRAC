const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // load .env variables

const sequelize = require("./util/database");

// Import models
const User = require("./models/users");
const Group = require("./models/groups");
const Message = require("./models/messages");
const GroupMember = require("./models/groupMembers");

// Associations
User.hasMany(Message, { foreignKey: "UserId" });
Message.belongsTo(User, { foreignKey: "UserId" });

Group.hasMany(Message, { foreignKey: "GroupId" });
Message.belongsTo(Group, { foreignKey: "GroupId" });

User.belongsToMany(Group, { through: GroupMember, foreignKey: "UserId" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "GroupId" });

GroupMember.belongsTo(User, { foreignKey: "UserId" });
GroupMember.belongsTo(Group, { foreignKey: "GroupId" });

// Routes
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const groupRoutes = require("./routes/group");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Register routes
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/group", groupRoutes);

// Sync models with DB, then start server
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("DB sync error:", err));
