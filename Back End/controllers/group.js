const Group = require("../models/groups");
const User = require("../models/users");
const GroupMember = require("../models/groupMembers");

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id; // assuming your auth middleware attaches user info

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Check if group already exists
    const existingGroup = await Group.findOne({ where: { name } });
    if (existingGroup) {
      return res.status(409).json({ error: "Group name already exists. Please choose another name." });
    }

    // Create new group
    const group = await Group.create({ name });

    // Automatically add creator as a member (admin)
    await GroupMember.create({
      GroupId: group.id,
      UserId: userId,
      role: "admin"
    });

    res.status(201).json({ 
      message: "Group created successfully and you are added as admin", 
      data: group 
    });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Optional: list all groups
exports.listGroups = async (req, res) => {
  try {
    const userId = req.user.id; // current logged-in user

    const groups = await Group.findAll({
      include: [
        {
          model: User,
          where: { id: userId },   // only groups that have this user
          attributes: []           // don’t need user fields in the response
        }
      ]
    });

    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a member to a group
exports.addMember = async (req, res) => {
  try {
    const { groupId, email } = req.body;

    if (!groupId || !email) {
      return res.status(400).json({ error: "Group ID and email are required" });
    }

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      where: { GroupId: groupId, UserId: user.id }
    });
    if (existingMember) {
      return res.status(409).json({ error: "User is already a member of this group" });
    }

    // Add user to group
    const newMember = await GroupMember.create({
      GroupId: groupId,
      UserId: user.id,
      role: "member"
    });

    res.status(201).json({ message: "Member added successfully", data: newMember });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMembers = async (req, res) => {
  const groupId = req.params.id;
  try {
    const members = await GroupMember.findAll({
      where: { GroupId: groupId },
      include: [
        {
          model: User,
          attributes: ["id", "fullname"] // include id here
        }
      ]
    });

    res.json(
      members.map(m => ({
        id: m.User.id,          // 👈 this is the memberId you need
        fullname: m.User.fullname,
        role: m.role            // optional, useful for showing admin/member
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

// Remove a member from a group
exports.removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.memberId;

    // console.log("MEMBBEBREB",groupId,memberId);

    const member = await GroupMember.findOne({
      where: { GroupId: groupId, UserId: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found in this group" });
    }

    await member.destroy();

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("Error removing member:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


