function login(event) {
    event.preventDefault(); // Prevent page reload
  
    // Collect form values using event.target
    const email = event.target.email.value;
    const password = event.target.password.value;
  
    const loginData = { email, password };
  
    // Axios POST request
    axios.post("http://localhost:3000/user/login", loginData)
      .then(response => {
        alert(response.data.message); // ✅ show backend success message
        console.log(response.data);
  
        // Example: redirect to dashboard
        window.location.href = "./dashboard.html";
      })
      .catch(error => {
        console.error("Error during login:", error);
  
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message); // show backend error message
        } else {
          alert("Login failed. Please try again.");
        }
      });
}
  