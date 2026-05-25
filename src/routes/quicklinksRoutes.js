// routes/quicklinkRoutes.js
const express = require("express");
const router = express.Router();
const quickLinkController = require("../controllers/quickLinkController");
const { protect } = require("../middleware/protect");

router.get("/", quickLinkController.getAllLinks); // Hamma ko'ra oladi
router.post("/", protect, quickLinkController.createLink); // Faqat admin
router.delete("/:id", protect, quickLinkController.deleteLink); // Faqat admin

module.exports = router;
