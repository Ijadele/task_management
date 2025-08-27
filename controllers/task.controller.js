const taskModel = require("../models/task.model");

const createTask = async (req, res, next) => {
  try {
    const { title, dueDate, priority, ...rest } = req.body;
    if (!title) {
      res.status(400).json({ message: "Title is required" });
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ message: "Priority must be low, medium, or high" });
    }

    const task = await taskModel.create({
      title,
      dueDate,
      priority,
      owner: req.user.id,
      ...rest,
    });

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      completed,
      priority,
      overdue,
      q,
      all,
      sort = "-createdAt",
    } = req.query;
    const p = Math.max(parseInt(page) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const filter = {};
    if (!(all === "true" && req.user.role === "admin"))
      filter.owner = req.user.id;
    if (category) filter.category = category;
    if (typeof completed !== "undefined")
      filter.completed = completed === "true";
    if (priority) filter.priority = priority;
    if (q)
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    if (overdue === "true") {
      filter.completed = false;
      filter.dueDate = { $lt: new Date() };
    }

    const [data, total] = await Promise.all([
      taskModel
        .find(filter)
        .sort(sort)
        .skip((p - 1) * l)
        .limit(l),
      taskModel.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// getsingle task (owner or admin)
const getTaskById = async (req, res, next) => {
  try {
    const { id } =  req.query; // use params instead of query

    const task = await taskModel.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isOwner = task.owner.equals(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ task, isOwner });
  } catch (error) {
    next(error);
  }
};

// update task
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskModel.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isOwner = task.owner.equals(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      task[key] = updates[key];
    });
    await task.save();

    res.json({ message: "Task updated", task });
  } catch (error) {
    next(error);
  }
};

// delete task
const deleteTask = async (req, res, next) => {
  try {
    const { id } =  req.params;
    const task = await taskModel.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isOwner = task.owner.equals(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

// Toggle complete status
const toggleComplete = async (req, res, next) => {
  try {
    const { id } =  req.params;
    const task = await taskModel.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isOwner = task.owner.equals(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    task.completed = !task.completed;
    await task.save();
    res.json({ message: "Task updated", task });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleComplete,
};
