const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teachersController");
const Teacher = require("../models/teachers");
const findById = require("../middleware/findById");
const { protect } = require("../middleware/protect");

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       200:
 *         description: Teacher created successfully
 */
router.post("/", protect, teacherController.createTeacher);

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: List of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 */
router.get("/", teacherController.getAllTeachers);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teacher]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 */
router.get("/:id", findById(Teacher), teacherController.getTeacherById);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher by ID
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 */
router.put("/:id", protect, findById(Teacher), teacherController.updateTeacher);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher by ID
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 */
router.delete(
  "/:id",
  protect,
  findById(Teacher),
  teacherController.deleteTeacher
);

module.exports = router;
