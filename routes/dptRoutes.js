const Dpt = require("../models/departments");
const express = require("express");
const router = express.Router();
const findById = require("../middleware/findById");
const DptController = require("../controllers/dptController");
const { protect, restrictTo } = require("../middleware/protect");

router.post("/", protect, DptController.createDpt);
router.get("/", DptController.getAllDpts);
router.get("/:id", findById(Dpt), DptController.getDptById);
router.put("/:id", protect, findById(Dpt), DptController.updateDpt);
router.delete("/:id", protect, findById(Dpt), DptController.deleteDpt);

module.exports = router;
