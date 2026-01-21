document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get("groupId");
  const groupInfo = document.getElementById("groupInfo");
  const token = localStorage.getItem("token");

  if (groupId) {
    groupInfo.textContent = `You are adding members to Group ID: ${groupId}`;
  } else {
    groupInfo.textContent = "No group selected.";
  }

  const form = document.getElementById("addMemberForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("memberEmail").value.trim();
    if (!email) return;

    try {
      await axios.post(
        "http://localhost:3000/group/add-member",
        {
          groupId,
          email,
        },
        {
          headers: { Authorization: token },
        }
      );

      alert(`Member with email "${email}" added to group ${groupId}`);
      form.reset();
      window.location.href = "./dashboard.html";
    } catch (err) {
      console.error("Error adding member:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to add member");
      }
    }
  });
});
