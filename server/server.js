const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRouter");
const transactionRoutes = require("./routes/transactionRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://finance-tracker-virid-chi.vercel.app", // ✅ Your deployed frontend
  "http://localhost:3000" // ✅ For local frontend testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);


app.use(helmet());
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
