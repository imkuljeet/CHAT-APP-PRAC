const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chat");

// POST /chat/send
router.post("/send", sendMessage);

module.exports = router;
