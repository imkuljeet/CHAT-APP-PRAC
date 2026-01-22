let socket = null;
let currentUserId = null; // global
let lastMessageId = null; // track last message for pagination
let reachedArchive = false; // flag when we start pulling from ArchivedChat

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  // Decode token to identify current user
  try {
    const decoded = jwt_decode(token); // requires jwt-decode library
    currentUserId = decoded.id; // assuming token payload includes { id }
  } catch (err) {
    console.error("Failed to decode token:", err);
  }

  // === Socket.io connection ===
  socket = io("http://localhost:3000", {
    auth: { token },
  });

  // === Groups Section ===
  const groupsContainer = document.createElement("div");
  groupsContainer.id = "groupsContainer";
  groupsContainer.innerHTML = "<h3>Your Groups</h3>";
  document.body.insertBefore(groupsContainer, document.getElementById("chatMessages"));

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
          li.style.cursor = "pointer";

          li.addEventListener("click", async () => {
            localStorage.setItem("selectedGroupId", group.id);

            const chatMessages = document.getElementById("chatMessages");
            chatMessages.innerHTML = "";
            lastMessageId = null;
            reachedArchive = false;

            ["addMemberBtn", "showMembersBtn", "membersList", "olderBtn"].forEach(id => {
              const el = document.getElementById(id);
              if (el) el.remove();
            });

            // Add Members button
            const addBtn = document.createElement("button");
            addBtn.id = "addMemberBtn";
            addBtn.textContent = "Add Members";
            addBtn.style.marginLeft = "10px";
            li.appendChild(addBtn);

            addBtn.addEventListener("click", () => {
              window.location.href = `add-members.html?groupId=${group.id}`;
            });

            // Show Members button
            const showBtn = document.createElement("button");
            showBtn.id = "showMembersBtn";
            showBtn.textContent = "Show Members";
            showBtn.style.marginLeft = "10px";
            li.appendChild(showBtn);

            showBtn.addEventListener("click", async () => {
              try {
                const res = await axios.get(
                  `http://localhost:3000/group/${group.id}/members`,
                  { headers: { Authorization: token } }
                );
                const members = res.data;

                const oldList = document.getElementById("membersList");
                if (oldList) oldList.remove();

                const membersDiv = document.createElement("div");
                membersDiv.id = "membersList";

                if (members.length === 0) {
                  membersDiv.textContent = "No members in this group.";
                } else {
                  const memberUl = document.createElement("ul");
                  members.forEach(m => {
                    const memberLi = document.createElement("li");
                    memberLi.textContent = `${m.fullname} (${m.role})`;
                    memberLi.style.cursor = "pointer";

                    memberLi.addEventListener("click", (e) => {
                      e.stopPropagation();
                      document.querySelectorAll(".member-actions").forEach(actions => actions.remove());

                      const currentUser = members.find(u => u.id === currentUserId);
                      if (currentUser && currentUser.role === "admin" && m.role !== "admin") {
                        const actionsDiv = document.createElement("div");
                        actionsDiv.className = "member-actions";

                        const makeAdminBtn = document.createElement("button");
                        makeAdminBtn.textContent = "Make Admin";
                        makeAdminBtn.style.marginLeft = "10px";
                        makeAdminBtn.addEventListener("click", async () => {
                          try {
                            await axios.post(
                              `http://localhost:3000/group/${group.id}/make-admin`,
                              { memberId: m.id },
                              { headers: { Authorization: token } }
                            );
                            alert(`${m.fullname} is now an admin`);
                            m.role = "admin";
                            memberLi.textContent = `${m.fullname} (admin)`;
                          } catch (err) {
                            console.error("Error making admin:", err);
                            alert("Failed to make admin");
                          }
                        });

                        const deleteBtn = document.createElement("button");
                        deleteBtn.textContent = "Delete Member";
                        deleteBtn.style.marginLeft = "10px";
                        deleteBtn.addEventListener("click", async () => {
                          try {
                            await axios.delete(
                              `http://localhost:3000/group/${group.id}/remove-member/${m.id}`,
                              { headers: { Authorization: token } }
                            );
                            alert(`${m.fullname} has been removed`);
                            memberLi.remove();
                          } catch (err) {
                            console.error("Error deleting member:", err);
                            alert("Failed to delete member");
                          }
                        });

                        actionsDiv.appendChild(makeAdminBtn);
                        actionsDiv.appendChild(deleteBtn);
                        memberLi.appendChild(actionsDiv);
                      }
                    });

                    memberUl.appendChild(memberLi);
                  });

                  membersDiv.appendChild(memberUl);
                }
                li.appendChild(membersDiv);
              } catch (err) {
                console.error("Error fetching members:", err);
                alert("Failed to load members");
              }
            });

            // Join group room via socket
            socket.emit("joinGroup", group.id);

            // Fetch initial messages
            fetchMessages(group.id);
          });

          ul.appendChild(li);
        });
        groupsContainer.appendChild(ul);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      groupsContainer.innerHTML = "<p>Failed to load groups.</p>";
    }
  }

  // === Messages Section ===
  function renderMessages(messages) {
    const chatMessages = document.getElementById("chatMessages");
    messages.forEach((msg) => {
      const msgDiv = document.createElement("div");
      msgDiv.textContent =
        msg.UserId === currentUserId
          ? `You: ${msg.content}`
          : `${msg.User?.fullname || "User"}: ${msg.content}`;
      // chatMessages.appendChild(msgDiv);
      chatMessages.insertBefore(msgDiv, chatMessages.firstChild);
    });
  }

  async function fetchMessages(groupId, beforeId = null) {
    try {
      const url = beforeId
        ? `http://localhost:3000/chat/messages?groupId=${groupId}&before=${beforeId}`
        : `http://localhost:3000/chat/messages?groupId=${groupId}`;
  
      const response = await axios.get(url, { headers: { Authorization: token } });
      const messages = response.data;
  
      if (!beforeId) {
        document.getElementById("chatMessages").innerHTML = "";
      }
  
      if (messages.length > 0) {
        messages.forEach((msg) => {
          const msgDiv = document.createElement("div");
          msgDiv.textContent =
            msg.UserId === currentUserId
              ? `You: ${msg.content}`
              : `${msg.User?.fullname || "User"}: ${msg.content}`;
          document.getElementById("chatMessages").appendChild(msgDiv);
        });
  
        lastMessageId = messages[messages.length - 1].id;
  
        let btn = document.getElementById("olderBtn");
        if (!btn) {
          btn = document.createElement("button");
          btn.id = "olderBtn";
          btn.textContent = "Get Older Messages";
          btn.onclick = () => fetchMessages(groupId, lastMessageId);
          document.getElementById("chatMessages").appendChild(btn);
        } else {
          btn.onclick = () => fetchMessages(groupId, lastMessageId);
        }
      } else {
        document.getElementById("olderBtn")?.remove();
        console.log("No more messages available.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }  

  // Listen for new messages via socket
  socket.on("newMessage", (msg) => {
    const chatMessages = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.textContent =
      msg.UserId === currentUserId
        ? `You: ${msg.content}`
        : `${msg.User?.fullname || "User"}: ${msg.content}`;
    // chatMessages.appendChild(msgDiv);
    chatMessages.insertBefore(msgDiv, chatMessages.firstChild);
  });

  // Initial load
  fetchGroups();

  // Redirect to group creation page
  document.getElementById("createGroupBtn").addEventListener("click", () => {
    window.location.href = "name-group.html";
  });
});

// Send message handler (via socket)
function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message === "") return;

  const groupId = localStorage.getItem("selectedGroupId");

  if (!groupId) {
    alert("Please select a group before sending a message.");
    return;
  }

  socket.emit("sendMessage", {
    message,
    groupId,
    userId: currentUserId,
  });

  input.value = "";
}
