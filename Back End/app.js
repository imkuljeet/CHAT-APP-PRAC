const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // load .env variables

const http = require("http");
const { Server } = require("socket.io");

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // adjust to your frontend origin
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Register routes
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/group", groupRoutes);

// Socket.io setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a group room
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Handle sending a message
  socket.on("sendMessage", async ({ message, groupId, userId }) => {
    try {
      const newMessage = await Message.create({
        content: message,
        UserId: userId,
        GroupId: groupId,
      });

      // Broadcast to everyone in the group room
      io.to(`group_${groupId}`).emit("newMessage", {
        id: newMessage.id,
        content: newMessage.content,
        UserId: userId,
        GroupId: groupId,
        createdAt: newMessage.createdAt,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Sync models with DB, then start server
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("DB sync error:", err));
