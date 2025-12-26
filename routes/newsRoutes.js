// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/uploads");
// const findById = require("../middleware/findById");
// const News = require("../models/news");
// const newsController = require("../controllers/newsController");
// const { protect } = require("../middleware/protect");

// /**
//  * @swagger
//  * tags:
//  *   name: News
//  *   description: Yangiliklar bo‘yicha CRUD amallar
//  */

// /**
//  * @swagger
//  * /api/news:
//  *   post:
//  *     summary: Yangi yangilik qo‘shish
//  *     tags: [News]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               title:
//  *                 type: string
//  *                 example: "Yangi loyiha ishga tushdi"
//  *               content:
//  *                 type: string
//  *                 example: "Bugun kompaniyamiz yangi platformani ishga tushirdi..."
//  *               image:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       201:
//  *         description: Yangi yangilik muvaffaqiyatli yaratildi
//  *       400:
//  *         description: Xato so‘rov
//  */
// router.post("/", protect, upload.single("image"), newsController.createNews);

// /**
//  * @swagger
//  * /api/news:
//  *   get:
//  *     summary: Barcha yangiliklarni olish
//  *     tags: [News]
//  *     responses:
//  *       200:
//  *         description: Muvaffaqiyatli
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/News'
//  */
// router.get("/", newsController.getAllNews);

// /**
//  * @swagger
//  * /api/news/{id}:
//  *   get:
//  *     summary: ID orqali bitta yangilikni olish
//  *     tags: [News]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Yangilik IDsi
//  *     responses:
//  *       200:
//  *         description: Muvaffaqiyatli
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/News'
//  *       404:
//  *         description: Topilmadi
//  */
// router.get("/:id", findById(News), newsController.getNewsById);

// /**
//  * @swagger
//  * /api/news/{id}:
//  *   put:
//  *     summary: Yangilikni yangilash
//  *     tags: [News]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Yangilik IDsi
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/News'
//  *     responses:
//  *       200:
//  *         description: Yangilandi
//  *       404:
//  *         description: Topilmadi
//  */
// router.put("/:id", protect, findById(News), newsController.updateNews);

// /**
//  * @swagger
//  * /api/news/{id}:
//  *   delete:
//  *     summary: Yangilikni o‘chirish
//  *     tags: [News]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Yangilik IDsi
//  *     responses:
//  *       200:
//  *         description: O‘chirildi
//  *       404:
//  *         description: Topilmadi
//  */
// router.delete("/:id", protect, findById(News), newsController.deleteNews);

// module.exports = router;

const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");

// DIQQAT: protect funksiyasini to'g'ri import qilish kerak!
// Agar exports.protect = ... deb yozilgan bo'lsa, {} ichida olinadi
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads"); // Yoki sizdagi multer config manzili

// TEST UCHUN LOG:
console.log("News Route Yuklandi. Protect funksiyasi bormi?", !!protect);

// CREATE (POST)
// Tartib: 1-Protect, 2-Upload, 3-Controller
router.post("/", protect, upload.single("image"), newsController.createNews);

// UPDATE (PATCH)
router.patch(
  "/:id",
  protect,
  upload.single("image"),
  newsController.updateNews
);

// DELETE
router.delete("/:id", protect, newsController.deleteNews);

// GET (Hamma ko'ra oladi, protect shart emas)
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);

module.exports = router;
