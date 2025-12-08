const User = require("../models/users");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;

    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User with this Email ID already exists" });
    }

    // Hash password before saving
    const saltRounds = 10; // cost factor
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user with hashed password
    const newUser = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup };
