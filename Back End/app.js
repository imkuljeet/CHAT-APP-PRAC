const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // load .env variables

const sequelize = require("./util/database");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat")

const app = express();
const PORT = process.env.PORT ;// fallback if .env not set

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

// Sync models with DB, then start server
sequelize.sync()
  .then(() => {
    console.log("Database synced");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("DB sync error:", err));
