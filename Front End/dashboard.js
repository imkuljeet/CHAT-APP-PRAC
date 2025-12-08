document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const token = localStorage.getItem("token");

  // Decode token to identify current user
  let currentUserId = null;
  try {
    const decoded = jwt_decode(token); // requires jwt-decode library
    currentUserId = decoded.id;        // assuming token payload includes { id }
  } catch (err) {
    console.error("Failed to decode token:", err);
  }

  async function fetchMessages() {
    try {
      const response = await axios.get("http://localhost:3000/chat/messages", {
        headers: { Authorization: token },
      });
  
      const messages = response.data;
  
      // ✅ Save messages to localStorage
      localStorage.setItem("fetchedMessages", JSON.stringify(messages));
  
      // Clear existing messages
      chatMessages.innerHTML = "";
  
      // Render each message
      messages.forEach((msg) => {
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
