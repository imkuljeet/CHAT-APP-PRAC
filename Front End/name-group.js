// Wait until DOM is ready
function createGroup(event) {
  event.preventDefault();

  const groupName = document.getElementById("groupNameInput").value.trim();
  const token = localStorage.getItem("token");

  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  axios.post("http://localhost:3000/group/create-groups", { name: groupName }, {
    headers: { Authorization: token }
  })
  .then(() => {
    alert(`Group "${groupName}" created successfully!`);
    window.location.href = "dashboard.html"; // redirect back
  })
  .catch(err => {
    console.error("Error creating group:", err);

    // Alert the error message returned by backend
    if (err.response && err.response.data && err.response.data.error) {
      alert(err.response.data.error);
    } else {
      alert("Failed to create group");
    }
  });
}
