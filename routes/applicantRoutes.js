const express = require("express");
const router = express.Router();
const applicantController = require("../controllers/applicantController");
const { protect } = require("../middleware/protect");

// POST: /api/applicants (Ochiq)
router.post("/", applicantController.createApplicant);

// GET & DELETE: /api/applicants (Yopiq - faqat admin)
router.get("/", applicantController.getAllApplicants);
router.delete("/:id", applicantController.deleteApplicant);

module.exports = router;
