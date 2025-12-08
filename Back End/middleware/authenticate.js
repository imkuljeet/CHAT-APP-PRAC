const jwt = require("jsonwebtoken");
const User = require("../models/users");

const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from decoded payload
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token: user not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
