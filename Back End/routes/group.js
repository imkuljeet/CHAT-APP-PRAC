const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const authenticate = require("../middleware/authenticate");

// Existing routes
router.post("/create-groups", authenticate, groupController.createGroup);
router.get("/list", authenticate, groupController.listGroups);

// New route for adding members
router.post("/add-member", authenticate, groupController.addMember);

module.exports = router;
