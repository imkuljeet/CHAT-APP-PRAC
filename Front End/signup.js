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
  
    // Axios POST request
    axios.post("http://localhost:5000/user/signup", userData)
      .then(response => {
        alert("Signup successful!");
        console.log(response.data);
        // Optionally redirect
        // window.location.href = "/login";
      })
      .catch(error => {
        console.error("Error during signup:", error);
        alert("Signup failed. Please try again.");
      });
  }
  