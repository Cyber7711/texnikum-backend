const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");
const announcementsController = require("../controllers/announcementsController");
const findById = require("../middleware/findById");
const { protect } = require("../middleware/protect");

router.post(
  "/",
  protect,

  announcementsController.createAnnouncement
);
router.get("/", protect, announcementsController.getAllAnnouncements);
router.get(
  "/:id",
  protect,
  findById(Announcement),
  announcementsController.getAnnouncementById
);
router.put(
  "/:id",
  protect,

  findById(Announcement),
  announcementsController.updateAnnouncement
);
router.delete(
  "/:id",
  protect,

  findById(Announcement),
  announcementsController.deleteAnnouncement
);

module.exports = router;
