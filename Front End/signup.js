function signup(event) {
    event.preventDefault(); // Prevent page reload
  
    // Collect form values using event.target
    const fullname = event.target.fullname.value;
    const email = event.target.email.value;
    const phone = event.target.phone.value;
    const password = event.target.password.value;
  
    // Prepare payload
    const userData = {
      fullname,
      email,
      phone,
      password
    };
  
    axios.post("http://localhost:3000/user/signup", userData)
  .then(response => {
    alert(response.data.message); // ✅ show backend success message
    console.log(response.data);
    // Optionally redirect
     window.location.href = "./login.html";
  })
  .catch(error => {
    console.error("Error during signup:", error);

    // If backend sent a response, show that message
    if (error.response && error.response.data && error.response.data.message) {
      alert(error.response.data.message);
    } else {
      alert("Signup failed. Please try again.");
    }
  });

  }
  