document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const token = localStorage.getItem("token");

  // Decode token to identify current user
  let currentUserId = null;
  try {
    const decoded = jwt_decode(token); // requires jwt-decode library
    currentUserId = decoded.id; // assuming token payload includes { id }
  } catch (err) {
    console.error("Failed to decode token:", err);
  }

  async function fetchMessages() {
    try {
      // 1. Load old messages from localStorage
      let storedMessages =
        JSON.parse(localStorage.getItem("fetchedMessages")) || [];
      let lastMessageId =
        storedMessages.length > 0
          ? storedMessages[storedMessages.length - 1].id
          : 0;

      // Render stored messages first
      chatMessages.innerHTML = "";
      storedMessages.forEach((msg) => {
        const msgDiv = document.createElement("div");
        if (msg.UserId === currentUserId) {
          msgDiv.textContent = `You: ${msg.content}`;
        } else {
          msgDiv.textContent = `${msg.User.fullname}: ${msg.content}`;
        }
        chatMessages.appendChild(msgDiv);
      });

      // 2. Fetch only newer messages from API
      const response = await axios.get(
        `http://localhost:3000/chat/messages?after=${lastMessageId}`,
        {
          headers: { Authorization: token },
        }
      );

      const newMessages = response.data;

      // 3. Merge new messages with old ones
      let updatedMessages = [...storedMessages, ...newMessages];

      // Keep only the last 5 messages
      if (updatedMessages.length > 5) {
        updatedMessages = updatedMessages.slice(-5);
      }

      localStorage.setItem("fetchedMessages", JSON.stringify(updatedMessages));

      // 4. Render new messages
      newMessages.forEach((msg) => {
        const msgDiv = document.createElement("div");
        if (msg.UserId === currentUserId) {
          msgDiv.textContent = `You: ${msg.content}`;
        } else {
          msgDiv.textContent = `${msg.User.fullname}: ${msg.content}`;
        }
        chatMessages.appendChild(msgDiv);
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // Initial load
  fetchMessages();

  // Refresh messages every 3 seconds
  // setInterval(fetchMessages, 3000);
});

// Send message handler
async function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message === "") return;

  const token = localStorage.getItem("token");

  try {
    await axios.post(
      "http://localhost:3000/chat/send",
      { message },
      { headers: { Authorization: token } }
    );

    // Show backend response in chat immediately
    const chatMessages = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `You: ${message}`;
    chatMessages.appendChild(msgDiv);

    input.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message");
  }
}
