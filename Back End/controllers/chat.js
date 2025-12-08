const Message = require("../models/messages");
const User = require("../models/users");
const { Op } = require("sequelize");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const newMessage = await Message.create({
      content: message,
      UserId: req.user.id,
    });

    res.status(201).json({ message: "Message stored", data: newMessage });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch messages by range (newer or older)
const getMessages = async (req, res) => {
  try {
    const afterId = req.query.after ? parseInt(req.query.after, 10) : null;
    const beforeId = req.query.before ? parseInt(req.query.before, 10) : null;

    let where = {};
    if (afterId) {
      where.id = { [Op.gt]: afterId }; // newer messages
    }
    if (beforeId) {
      where.id = { [Op.lt]: beforeId }; // older messages
    }

    const messages = await Message.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["fullname"], // safe fields only
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 5, // optional: fetch in small chunks
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendMessage, getMessages };
