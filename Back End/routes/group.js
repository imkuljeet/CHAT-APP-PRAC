const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const authenticate = require("../middleware/authenticate"); // protect if needed

// POST /group/create-groups
router.post("/create-groups", authenticate, groupController.createGroup);

// GET /group/list
router.get("/list", authenticate, groupController.listGroups);

module.exports = router;
