const express = require("express");
const helmet = require('helmet');
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRouter");
const transactionRoutes = require("./routes/transactionRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);


const connectDB = require("./config/db");
connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
