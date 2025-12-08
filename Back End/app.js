const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // load .env variables

const userRoutes = require("./routes/user");

const app = express();
const PORT = process.env.PORT; // fallback if .env not set

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/user", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
