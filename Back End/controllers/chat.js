// Simple controller for chat messages
const sendMessage = (req, res) => {
    try {
      const { message } = req.body;
  
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
  
      console.log("Received message:", message);
  
      // For now, just echo back a reply
      res.status(200).json({
        reply: `Server received: "${message}"`
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  module.exports = { sendMessage };
  