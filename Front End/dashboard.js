document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Decode token to identify current user
  let currentUserId = null;
  try {
    const decoded = jwt_decode(token); // requires jwt-decode library
    currentUserId = decoded.id;        // assuming token payload includes { id }
  } catch (err) {
    console.error("Failed to decode token:", err);
  }

  // Fetch all messages when dashboard loads
  axios
    .get("http://localhost:3000/chat/messages", {
      headers: {
        Authorization: token, // attach token directly
      },
    })
    .then((response) => {
      const messages = response.data; // backend should return array of messages with User info

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
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      alert("Failed to load messages");
    });
});

// Send message handler
function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message === "") return;

  // Get token (assume stored in localStorage after login)
  const token = localStorage.getItem("token");

  // Axios POST request to backend with token in headers
  axios
    .post(
      "http://localhost:3000/chat/send",
      { message },
      {
        headers: {
          Authorization: token, // attach token directly
        },
      }
    )
    .then((response) => {
      // Show backend response in chat immediately
      const chatMessages = document.getElementById("chatMessages");
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `You: ${message}`;
      chatMessages.appendChild(msgDiv);

      // Clear input
      input.value = "";
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    });
}
