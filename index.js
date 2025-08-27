const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const taskRoutes = require("./routes/task.route");
const userRoutes = require("./routes/user.route");

const app = express();

// DB
mongoose
  .connect(process.env.MONGO_API_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5100;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
