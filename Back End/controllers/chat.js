const Message = require("../models/messages");
const User = require("../models/users");
const Group = require("../models/groups");
const ArchivedChat = require("../models/archivedChat");

const { Op } = require("sequelize");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { message, groupId } = req.body;  // include groupId

    if (!message || !groupId) {
      return res.status(400).json({ message: "Message and groupId are required" });
    }

    // Check if group exists (optional but recommended)
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const newMessage = await Message.create({
      content: message,
      UserId: req.user.id,
      GroupId: groupId,   // store groupId with the message
    });

    res.status(201).json({ message: "Message stored", data: newMessage });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const afterId = req.query.after ? parseInt(req.query.after, 10) : null;
    const beforeId = req.query.before ? parseInt(req.query.before, 10) : null;
    const groupId = req.query.groupId;

    if (!groupId) {
      return res.status(400).json({ error: "groupId is required" });
    }

    let where = { GroupId: groupId };

    if (afterId) {
      where.id = { [Op.gt]: afterId };
    }
    if (beforeId) {
      where.id = { [Op.lt]: beforeId };
    }

    // First try fetching from Message table
    let messages = await Message.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["fullname"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // If empty, fallback to ArchivedChat
    if (messages.length === 0) {
      messages = await ArchivedChat.findAll({
        where,
        include: [
          {
            model: User,
            attributes: ["fullname"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendMessage, getMessages };
