const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const findById = require("../middleware/findById");
const Stats = require("../models/statistics");
const { protect } = require("../middleware/protect");

router.post("/", protect, statsController.createStats);
router.get("/", protect, statsController.getAllStats);
router.get("/:id", protect, findById(Stats), statsController.getStatsById);
router.put("/:id", protect, findById(Stats), statsController.updateStats);
router.delete("/:id", protect, findById(Stats), statsController.deleteStats);

module.exports = router;
