document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  let currentUserId = null;

  // Decode token to identify current user
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

          li.addEventListener("click", () => {
            // Save selected groupId
            localStorage.setItem("selectedGroupId", group.id);

            // Clear chat area
            const chatMessages = document.getElementById("chatMessages");
            chatMessages.innerHTML = "";

            // Remove any existing buttons/divs
            ["addMemberBtn", "showMembersBtn", "membersList"].forEach(id => {
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

            showBtn.addEventListener("click", async (e) => {
              try {
                // e.stopPropagation();
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
                    memberLi.textContent = m.fullname;
                    memberLi.style.cursor = "pointer";
            
                    memberLi.addEventListener("click", (e) => {
                      e.stopPropagation();
                    
                      // 🔹 First remove all other member-actions in the list
                      document.querySelectorAll(".member-actions").forEach(actions => actions.remove());
                    
                      // 🔹 Then check if this member already has actions (toggle behavior)
                      const existingActions = memberLi.querySelector(".member-actions");
                      if (existingActions) {
                        existingActions.remove();
                        return;
                      }
                    
                      // Create action buttons container
                      const actionsDiv = document.createElement("div");
                      actionsDiv.className = "member-actions";
                    
                      // Make Admin button
                      const makeAdminBtn = document.createElement("button");
                      makeAdminBtn.textContent = "Make Admin";
                      makeAdminBtn.style.marginLeft = "10px";
                    
                      //Delete Member button
                      const deleteBtn = document.createElement("button");
                      deleteBtn.textContent = "Delete Member";
                      deleteBtn.style.marginLeft = "10px";
                      
                      deleteBtn.addEventListener("click", async (e) => {
                        e.stopPropagation(); // prevent triggering parent clicks
                        try {
                          await axios.delete(
                            `http://localhost:3000/group/${group.id}/remove-member/${m.id}`,
                            { headers: { Authorization: token } }
                          );
                          alert(`${m.fullname} has been removed`);
                          memberLi.remove(); // remove from UI immediately
                        } catch (err) {
                          console.error("Error deleting member:", err);
                          alert("Failed to delete member");
                        }
                      });                   

                      actionsDiv.appendChild(makeAdminBtn);
                      actionsDiv.appendChild(deleteBtn);
                      memberLi.appendChild(actionsDiv);
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

            // Fetch messages for this group
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
  async function renderMessages(messages, groupId) {
    const chatMessages = document.getElementById("chatMessages");
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

  async function fetchMessages(groupId) {
    try {
      const response = await axios.get(
        `http://localhost:3000/chat/messages?groupId=${groupId}`,
        { headers: { Authorization: token } }
      );
      const messages = response.data;
      await renderMessages(messages, groupId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // Initial load
  fetchGroups();

  // Redirect to group creation page
  document.getElementById('createGroupBtn').addEventListener('click', () => {
    window.location.href = 'name-group.html';
  });
});

// Send message handler
async function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message === "") return;

  const token = localStorage.getItem("token");
  const groupId = localStorage.getItem("selectedGroupId");

  if (!groupId) {
    alert("Please select a group before sending a message.");
    return;
  }

  try {
    await axios.post(
      "http://localhost:3000/chat/send",
      { message, groupId },
      { headers: { Authorization: token } }
    );

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
