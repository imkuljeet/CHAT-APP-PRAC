// Simple in-memory "database"
let users = [];

// Controller function
const signup = (req, res) => {
  const { fullname, email, phone, password } = req.body;

  // Basic validation
  if (!fullname || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Save user (in-memory for now)
  const newUser = { fullname, email, phone, password };
  users.push(newUser);

  // Log only fullname & email
  console.log("New signup:", fullname, email);

  res.status(201).json({ message: "User registered successfully", user: newUser });
};

module.exports = { signup };
