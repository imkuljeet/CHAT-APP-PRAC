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
      // Show backend response in chat
      const chatMessages = document.getElementById("chatMessages");
      const msgDiv = document.createElement("div");
      msgDiv.textContent = "You: " + message;
      chatMessages.appendChild(msgDiv);

      // Clear input
      input.value = "";
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    });
}
