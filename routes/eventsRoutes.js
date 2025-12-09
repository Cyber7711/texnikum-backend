const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const findById = require("../middleware/findById");
const Event = require("../models/event");
const { protect } = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Event
 *   description: Tadbirlar bilan ishlash
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Yangi tadbir yaratish
 *     security:
 *       - bearerAuth: []
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Tadbir muvaffaqiyatli yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Noto‘g‘ri ma'lumot kiritildi
 *
 *   get:
 *     summary: Barcha tadbirlarni olish
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Tadbirlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: ID bo‘yicha tadbirni olish
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tadbir topildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Tadbir topilmadi
 *
 *   put:
 *     summary: Tadbirni yangilash
 *     security:
 *       - bearerAuth: []
 *     tags: [Event]
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
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Tadbir yangilandi
 *       404:
 *         description: Tadbir topilmadi
 *
 *   delete:
 *     summary: Tadbirni o‘chirish
 *     security:
 *       - bearerAuth: []
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tadbir o‘chirildi
 *       404:
 *         description: Tadbir topilmadi
 */

router.post("/", protect, eventsController.createEvent);
router.get("/", eventsController.getAllEvent);
router.get("/:id", findById(Event), eventsController.getEventById);
router.put("/:id", protect, findById(Event), eventsController.updateEvent);
router.delete("/:id", protect, findById(Event), eventsController.deleteEvent);

module.exports = router;
