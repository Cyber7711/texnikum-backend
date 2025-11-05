const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const findById = require("../middleware/findById");
const Event = require("../models/events");
const { protect } = require("../middleware/protect");

router.post("/", protect, eventsController.createEvent);
router.get("/", eventsController.getAllEvent);
router.get("/:id", findById(Event), eventsController.getEventById);
router.put(
  "/:id",
  protect,

  findById(Event),
  eventsController.updateEvent
);
router.delete("/:id", protect, findById(Event), eventsController.deleteEvent);

module.exports = router;
