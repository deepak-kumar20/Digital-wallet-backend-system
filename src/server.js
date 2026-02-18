const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Import routes
const authRoutes = require('./routes/authRoutes')
const walletRoutes = require('./routes/walletRoutes')
const transactionRoutes = require('./routes/transactionRoutes') 
const userRoutes = require('./routes/userRoutes')

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

console.log('This is running server');

//health
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});