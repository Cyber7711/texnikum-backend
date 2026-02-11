const express = require("express");
const router = express.Router();

const managementController = require("../controllers/managementController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads");

router.get("/", managementController.getManagement);

router.get("/all", protect, managementController.getAllFlat);

router.post(
  "/",
  protect,
  upload.single("image"),
  managementController.createManagement,
);
router.patch(
  "/:id",
  protect,
  upload.single("image"),
  managementController.updateManagement,
);
router.delete("/:id", protect, managementController.deleteManagement);

module.exports = router;
