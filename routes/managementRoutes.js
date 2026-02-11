const express = require("express");
const router = express.Router();

const managementController = require("../controllers/managementController");
const { protect } = require("../middleware/protect");
const { uploadSingle } = require("../middleware/uploads");
// Eslatma: news’da qanday bo‘lsa xuddi shuni ishlat.
// Agar sende boshqa nom bo‘lsa — o‘sha.

router.get("/", managementController.getManagement);

// admin uchun flat list (qulay)
router.get("/all", protect, managementController.getAllFlat);

router.post(
  "/",
  protect,
  uploadSingle("image"),
  managementController.createManagement,
);
router.patch(
  "/:id",
  protect,
  uploadSingle("image"),
  managementController.updateManagement,
);
router.delete("/:id", protect, managementController.deleteManagement);

module.exports = router;
