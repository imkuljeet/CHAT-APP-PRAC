const express = require("express");
const router = express.Router();
const { sendMessage, getMessagesByLastId } = require("../controllers/chat");
const authenticate = require("../middleware/authenticate"); // import middleware

// POST /chat/send (protected route)
router.post("/send", authenticate, sendMessage);
// GET /chat/messages
router.get("/messages", authenticate, getMessagesByLastId);

module.exports = router;
