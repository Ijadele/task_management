const userModel = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hashed password
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await userModel.create({
      email,
      password: hashedPassword,
      ...rest,
    });
    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    next(error);
  }
};

// get all users
const getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const users = await userModel
      .find()
      .select("-password")
      .populate("todos", "title completed dueDate category");
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

// get user by Id
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

module.exports = {register, getUsers, getUserById, login, logout}