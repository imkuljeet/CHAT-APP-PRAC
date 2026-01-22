const cron = require("node-cron");
const { Op } = require("sequelize");
const Message = require("../models/messages");
const ArchivedChat = require("../models/archivedChat");

// Run every minute
cron.schedule("*/1 * * * *", async () => {
  try {
    // Cutoff: messages older than 1 minute
    const cutoff = new Date(Date.now() - 1 * 60 * 1000);
    // const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldMessages = await Message.findAll({
      where: { createdAt: { [Op.lt]: cutoff } },
    });

    if (oldMessages.length > 0) {
      await ArchivedChat.bulkCreate(oldMessages.map(m => m.toJSON()));
      await Message.destroy({ where: { createdAt: { [Op.lt]: cutoff } } });
      console.log(`Archived and deleted ${oldMessages.length} messages`);
    } else {
      console.log("No messages to archive this run");
    }
  } catch (err) {
    console.error("Error in archive cron job:", err);
  }
});
