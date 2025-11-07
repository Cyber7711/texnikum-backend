const express = require("express");
const router = express.Router();
const findById = require("../middleware/findById");
const docController = require("../controllers/docController");
const Docs = require("../models/documents");
const { protect } = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Hujjatlar bilan ishlash
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Yangi hujjat yaratish
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Docs'
 *     responses:
 *       201:
 *         description: Hujjat yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docs'
 *       400:
 *         description: Noto‘g‘ri ma’lumot
 *
 *   get:
 *     summary: Barcha hujjatlarni olish
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Hujjatlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Docs'
 */

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: ID orqali hujjatni olish
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hujjat topildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docs'
 *       404:
 *         description: Hujjat topilmadi
 *
 *   put:
 *     summary: Hujjatni yangilash
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
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
 *             $ref: '#/components/schemas/Docs'
 *     responses:
 *       200:
 *         description: Hujjat yangilandi
 *       404:
 *         description: Hujjat topilmadi
 *
 *   delete:
 *     summary: Hujjatni o‘chirish
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hujjat o‘chirildi
 *       404:
 *         description: Hujjat topilmadi
 */

router.post("/", protect, docController.createDoc);
router.get("/", docController.getAllDocs);
router.get("/:id", findById(Docs), docController.getDocById);
router.put("/:id", protect, findById(Docs), docController.updateDoc);
router.delete("/:id", protect, findById(Docs), docController.deleteDoc);

module.exports = router;
