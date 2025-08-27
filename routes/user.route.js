const express = require("express");
const {
  register,
  getUsers,
  getUserById,
  login,
  logout,
} = require("../controllers/user.controller");
const authentication = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", register);
router.get("/", authentication, getUsers);
router.get("/:id", authentication, getUserById);
router.post("/login", login);
router.post("/logout", authentication, logout);

module.exports = router;