const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const authenticate = require("../middleware/authenticate");

// Existing routes

router.get("/:id/members", authenticate, groupController.getMembers);

router.post("/create-groups", authenticate, groupController.createGroup);
router.get("/list", authenticate, groupController.listGroups);

// New route for adding members
router.post("/add-member", authenticate, groupController.addMember);
// routes/group.js

// Delete member from group
router.delete("/:id/remove-member/:memberId", authenticate, groupController.removeMember);


module.exports = router;
