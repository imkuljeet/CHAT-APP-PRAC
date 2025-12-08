const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chat");
const authenticate = require("../middleware/authenticate"); // import middleware

// POST /chat/send (protected route)
router.post("/send", authenticate, sendMessage);

module.exports = router;
