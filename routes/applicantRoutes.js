const express = require("express");
const router = express.Router();
const applicantController = require("../controllers/applicantController");
const { protect } = require("../middleware/protect");

// POST: /api/applicants (Ochiq)
router.post("/", protect, applicantController.createApplicant);

// GET & DELETE: /api/applicants (Yopiq - faqat admin)
router.get("/", protect, applicantController.getAllApplicants);
router.delete("/:id", protect, applicantController.deleteApplicant);

module.exports = router;
