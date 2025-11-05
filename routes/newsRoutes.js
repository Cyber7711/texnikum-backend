const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const findById = require("../middleware/findById");
const News = require("../models/news");
const newsController = require("../controllers/newsController");
const { protect } = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: News
 *   description: Yangiliklar bo‘yicha CRUD amallar
 */

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Yangi yangilik qo‘shish
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Yangi loyiha ishga tushdi"
 *               content:
 *                 type: string
 *                 example: "Bugun kompaniyamiz yangi platformani ishga tushirdi..."
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Yangi yangilik muvaffaqiyatli yaratildi
 *       400:
 *         description: Xato so‘rov
 */
router.post("/", protect, upload.single("image"), newsController.createNews);

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Barcha yangiliklarni olish
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 */
router.get("/", newsController.getAllNews);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: ID orqali bitta yangilikni olish
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Yangilik IDsi
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: Topilmadi
 */
router.get("/:id", findById(News), newsController.getNewsById);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Yangilikni yangilash
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Yangilik IDsi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/News'
 *     responses:
 *       200:
 *         description: Yangilandi
 *       404:
 *         description: Topilmadi
 */
router.put("/:id", protect, findById(News), newsController.updateNews);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Yangilikni o‘chirish
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Yangilik IDsi
 *     responses:
 *       200:
 *         description: O‘chirildi
 *       404:
 *         description: Topilmadi
 */
router.delete("/:id", protect, findById(News), newsController.deleteNews);

module.exports = router;
