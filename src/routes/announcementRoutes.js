const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");
const announcementsController = require("../controllers/announcementsController");
const { protect } = require("../middleware/protect");
const validate = require("../middleware/validate");
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} = require("../validations/annoucement.validation");
/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: E’lonlar bilan ishlash
 */

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Yangi e’lon yaratish
 *     security:
 *       - bearerAuth: []
 *     tags: [Announcements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       201:
 *         description: E’lon yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *
 *   get:
 *     summary: Barcha e’lonlarni olish
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: E’lonlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 */

/**
 * @swagger
 * /api/announcements/{id}:
 *   get:
 *     summary: ID orqali e’lonni olish
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E’lon topildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *
 *   put:
 *     summary: E’lonni yangilash
 *     security:
 *       - bearerAuth: []
 *     tags: [Announcements]
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
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       200:
 *         description: E’lon yangilandi
 *
 *   delete:
 *     summary: E’lonni o‘chirish
 *     security:
 *       - bearerAuth: []
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E’lon o‘chirildi
 */

router.post(
  "/",
  protect,
  validate(createAnnouncementSchema),
  announcementsController.createAnnouncement,
);
router.get("/", announcementsController.getAllAnnouncements);
router.get(
  "/:id",

  announcementsController.getAnnouncementById,
);
router.put(
  "/:id",
  protect,
  validate(updateAnnouncementSchema),

  announcementsController.updateAnnouncement,
);
router.delete(
  "/:id",
  protect,

  announcementsController.deleteAnnouncement,
);

module.exports = router;
