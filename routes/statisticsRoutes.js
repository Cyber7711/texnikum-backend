// const express = require("express");
// const router = express.Router();
// const StatsController = require("../controllers/statsController");
// const findById = require("../middleware/findById");
// const Stats = require("../models/statistics");
// const { protect } = require("../middleware/protect");

// /**
//  * @swagger
//  * /stats:
//  *   post:
//  *     summary: Create a new stats entry
//  *     tags: [Stats]
//  *  description: Statistikajlar bo‘yicha CRUD amallar
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/Stats'
//  *     responses:
//  *       200:
//  *         description: Stats created successfully
//  */
// router.post("/", protect, StatsController.create);

// /**
//  * @swagger
//  * /stats:
//  *   get:
//  *     summary: Get all stats
//  *     tags: [Stats]
//  *     responses:
//  *       200:
//  *         description: List of stats
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Stats'
//  */
// router.get("/", StatsController.getAll);

// /**
//  * @swagger
//  * /stats/{id}:
//  *   get:
//  *     summary: Get a stats entry by ID
//  *     tags: [Stats]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Stats details
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Stats'
//  */
// router.get("/:id", findById(Stats), StatsController.getById);

// /**
//  * @swagger
//  * /stats/{id}:
//  *   put:
//  *     summary: Update a stats entry by ID
//  *     tags: [Stats]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/Stats'
//  *     responses:
//  *       200:
//  *         description: Stats updated successfully
//  */
// router.put("/:id", protect, findById(Stats), StatsController.update);

// /**
//  * @swagger
//  * /stats/{id}:
//  *   delete:
//  *     summary: Delete a stats entry by ID
//  *     tags: [Stats]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Stats deleted successfully
//  */
// router.delete("/:id", protect, findById(Stats), StatsController.deleted);

// module.exports = router;
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { protect } = require("../middleware/protect");

// 1. GET /statistics - Hammaga ochiq (Bosh sahifada ko'rinishi uchun)
// Bu getAll vazifasini bajaradi, lekin bitta obyekt qaytaradi
router.get("/", statsController.getAll);

// 2. POST /statistics - Faqat Admin uchun (Statistikani yaratish yoki yangilash)
// Bu create va update ni bitta qilgan "updateStats" funksiyamiz
router.post("/", protect, statsController.updateStats);

module.exports = router;
