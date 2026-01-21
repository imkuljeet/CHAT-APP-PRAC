const Group = require("../models/groups");

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
