const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleComplete,
} = require("../controllers/task.controller");
const authentication = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authentication, createTask);
router.get("/", authentication, getTasks);
router.get("/:id", authentication, getTaskById);
router.put("/:id", authentication, updateTask);
router.delete("/:id", authentication, deleteTask);
router.patch("/toggle/:id", authentication, toggleComplete);

module.exports = router;
