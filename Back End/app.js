const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // allow requests from frontend
app.use(bodyParser.json()); // parse JSON bodies

// Simple in-memory "database"
let users = [];

// Signup route
app.post("/user/signup", (req, res) => {
  const { fullname, email, phone, password } = req.body;

  // Basic validation
  if (!fullname || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Save user (in-memory for now)
  const newUser = { fullname, email, phone, password };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully", user: newUser });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
