const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teachersController");
const Teacher = require("../models/teachers");
const findById = require("../middleware/findById");
const { protect } = require("../middleware/protect");

router.post("/", protect, teacherController.createTeacher);
router.get("/", protect, teacherController.getAllTeachers);
router.get(
  "/:id",
  protect,
  findById(Teacher),
  teacherController.getTeacherById
);
router.put("/:id", protect, findById(Teacher), teacherController.updateTeacher);
router.delete(
  "/:id",
  protect,
  findById(Teacher),
  teacherController.deleteTeacher
);

module.exports = router;
