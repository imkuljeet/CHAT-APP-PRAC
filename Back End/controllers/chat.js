const Message = require("../models/messages");
const User = require("../models/users");
const { Op } = require("sequelize");

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

// const getMessages = async (req, res) => {
//   try {
//     // Fetch all messages with associated user info
//     const messages = await Message.findAll({
//       include: [
//         {
//           model: User,
//           attributes: ["fullname"], // only return safe fields
//         },
//       ],
//       order: [["createdAt", "ASC"]], // oldest first
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("Fetch messages error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const getMessagesByLastId = async (req,res) =>{

  try {
    const lastMessageId = parseInt(req.query.after, 10) || 0;

    const messages = await Message.findAll({
      where: lastMessageId
        ? { id: { [Op.gt]: lastMessageId } } // only newer messages
        : {}, // if no lastMessageId, return all
      include: [
        {
          model: User,
          attributes: ["fullname"], // safe fields only
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendMessage, getMessagesByLastId };
