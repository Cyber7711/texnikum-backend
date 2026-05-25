const express = require("express");
const router = express.Router();
const Dpt = require("../models/departments");
const DptController = require("../controllers/dptController");
const findById = require("../middleware/findById");
const { protect } = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Bo‘limlar bilan ishlash
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Yangi bo‘lim yaratish
 *     security:
 *       - bearerAuth: []
 *     tags: [Department]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       201:
 *         description: Bo‘lim muvaffaqiyatli yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Noto‘g‘ri ma’lumot
 *
 *   get:
 *     summary: Barcha bo‘limlarni olish
 *     tags: [Department]
 *     responses:
 *       200:
 *         description: Bo‘limlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: ID orqali bitta bo‘limni olish
 *     tags: [Department]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bo‘lim topildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Bo‘lim topilmadi
 *
 *   put:
 *     summary: Bo‘limni yangilash
 *     security:
 *       - bearerAuth: []
 *     tags: [Department]
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
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: Bo‘lim yangilandi
 *       404:
 *         description: Bo‘lim topilmadi
 *
 *   delete:
 *     summary: Bo‘limni o‘chirish
 *     security:
 *       - bearerAuth: []
 *     tags: [Department]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bo‘lim o‘chirildi
 *       404:
 *         description: Bo‘lim topilmadi
 */

router.post("/", protect, DptController.createDpt);
router.get("/", DptController.getAllDpts);
router.get("/:id", findById(Dpt), DptController.getDptById);
router.put("/:id", protect, findById(Dpt), DptController.updateDpt);
router.delete("/:id", protect, findById(Dpt), DptController.deleteDpt);

module.exports = router;
