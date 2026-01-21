const Group = require("../models/groups");
const User = require("../models/users");
const GroupMember = require("../models/groupMembers");

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Check if group already exists
    const existingGroup = await Group.findOne({ where: { name } });
    if (existingGroup) {
      return res.status(409).json({ 
        error: "Group name already exists. Please choose another name." 
      });
    }

    // Create new group
    const group = await Group.create({ name });
    res.status(201).json({ message: "Group created successfully", data: group });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Optional: list all groups
exports.listGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
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
          attributes: ["fullname"]
        }
      ]
    });  

    // const members = await GroupMember.findAll();

    // console.log(members);
    res.json(members.map(m => m.User)); // return just user info
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
};


