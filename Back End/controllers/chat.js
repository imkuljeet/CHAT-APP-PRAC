const Message = require("../models/messages");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Save message tied to authenticated user
    const newMessage = await Message.create({
      content: message,
      UserId: req.user.id
    });

    res.status(201).json({ message: "Message stored", data: newMessage });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendMessage };
