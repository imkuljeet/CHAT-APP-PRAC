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

  // === Groups Section ===
  const groupsContainer = document.createElement("div");
  groupsContainer.id = "groupsContainer";
  groupsContainer.innerHTML = "<h3>Your Groups</h3>";
  chatMessages.parentNode.insertBefore(groupsContainer, chatMessages);

  async function fetchGroups() {
    try {
      const response = await axios.get("http://localhost:3000/group/list", {
        headers: { Authorization: token }
      });
      const groups = response.data;

      groupsContainer.innerHTML = "<h3>Your Groups</h3>";
      if (groups.length === 0) {
        groupsContainer.innerHTML += "<p>No groups yet. Create one!</p>";
      } else {
        const ul = document.createElement("ul");
        groups.forEach(group => {
          const li = document.createElement("li");
          li.textContent = group.name;
          ul.appendChild(li);
        });
        groupsContainer.appendChild(ul);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      groupsContainer.innerHTML = "<p>Failed to load groups.</p>";
    }
  }

  // === Chat Section ===
  // Dynamically create the "Load Older Messages" button
  const loadOlderBtn = document.createElement("button");
  loadOlderBtn.id = "loadOlderBtn";
  loadOlderBtn.textContent = "Load older messages";
  loadOlderBtn.style.display = "none"; // hidden by default
  chatMessages.parentNode.insertBefore(loadOlderBtn, chatMessages);

  async function renderMessages(messages) {
    chatMessages.innerHTML = "";
    messages.forEach((msg) => {
      const msgDiv = document.createElement("div");
      msgDiv.textContent =
        msg.UserId === currentUserId
          ? `You: ${msg.content}`
          : `${msg.User.fullname}: ${msg.content}`;
      chatMessages.appendChild(msgDiv);
    });
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
      await renderMessages(storedMessages);

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

      // 4. Render updated messages
      await renderMessages(updatedMessages);

      // 5. Check if older messages exist → show/hide button
      if (updatedMessages.length > 0) {
        const firstMessageId = updatedMessages[0].id;
        const olderCheck = await axios.get(
          `http://localhost:3000/chat/messages?before=${firstMessageId}`,
          { headers: { Authorization: token } }
        );
        if (olderCheck.data.length === 0) {
          loadOlderBtn.style.display = "none"; // hide if none
        } else {
          loadOlderBtn.style.display = "block"; // show if available
        }
      } else {
        loadOlderBtn.style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // Load older messages handler
  loadOlderBtn.addEventListener("click", async () => {
    let storedMessages =
      JSON.parse(localStorage.getItem("fetchedMessages")) || [];
    let firstMessageId =
      storedMessages.length > 0 ? storedMessages[0].id : null;
    if (!firstMessageId) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/chat/messages?before=${firstMessageId}`,
        {
          headers: { Authorization: token },
        }
      );

      const olderMessages = response.data;

      if (olderMessages.length === 0) {
        // No older messages → hide button
        loadOlderBtn.style.display = "none";
        return;
      }

      // Prepend older messages to stored list
      const updatedMessages = [...olderMessages, ...storedMessages];

      localStorage.setItem("fetchedMessages", JSON.stringify(updatedMessages));

      // Render all messages including older ones
      await renderMessages(updatedMessages);
    } catch (error) {
      console.error("Error loading older messages:", error);
    }
  });

  // Initial load
  fetchGroups();   // load groups on dashboard
  fetchMessages(); // load chat messages

  // Refresh messages every 3 seconds (optional)
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

// Redirect to group creation page
document.getElementById('createGroupBtn').addEventListener('click', () => {
  window.location.href = 'name-group.html';
});
