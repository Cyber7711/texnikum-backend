const express = require("express");
const router = express.Router();

const managementController = require("../controllers/managementController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads"); // sening multer middleware’ing

// Public
router.get("/", managementController.getManagement);

// Admin edit (multipart/form-data)
router.patch(
  "/leader/:leaderId",
  protect,
  upload.single("image"),
  managementController.updateLeader,
);

module.exports = router;
