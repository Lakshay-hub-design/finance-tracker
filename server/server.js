// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRouter");
const transactionRoutes = require("./routes/transactionRoutes");

// App config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json()); // for parsing JSON body



app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);


// DB connection
const connectDB = require("./config/db");
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
