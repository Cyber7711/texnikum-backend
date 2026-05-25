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

const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const validate = require("../middleware/validate"); // Zod middleware
const {
  eventSchema,
  updateEventSchema,
} = require("../validations/event.validation");
const { protect } = require("../middleware/protect");

// Swagger dokumentatsiyasi shu yerda qoladi...

// 1. Yaratish: Avval loginni tekshir, keyin ma'lumotni Zod bilan filtrla
router.post("/", protect, validate(eventSchema), eventsController.createEvent);

// 2. Hammasini olish: Ochiq API
router.get("/", eventsController.getAllEvent);

// 3. ID bo'yicha olish:
router.get("/:id", eventsController.getEventById);

// 4. Yangilash: Login + Zod (optional maydonlar bilan)
router.put(
  "/:id",
  protect,
  validate(updateEventSchema),
  eventsController.updateEvent,
);

// 5. O'chirish: Faqat login
router.delete("/:id", protect, eventsController.deleteEvent);

module.exports = router;
