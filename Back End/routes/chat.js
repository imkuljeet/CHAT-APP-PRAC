const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/chat");
const authenticate = require("../middleware/authenticate"); // import middleware

// POST /chat/send (protected route)
// router.post("/send", authenticate, sendMessage);
// GET /chat/messages
router.get("/messages", authenticate, getMessages);

module.exports = router;
