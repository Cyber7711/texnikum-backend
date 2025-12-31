const express = require("express");
const router = express.Router();
const docController = require("../controllers/docController");
const { protect } = require("../middleware/protect");

// Jamoat uchun ochiq (Public)
router.get("/", docController.getAll);
router.get("/:id", docController.getById);

// Faqat Adminlar uchun (Protected)
router.use(protect);

router.post("/", docController.create);
router.put("/:id", docController.update);
router.delete("/:id", docController.deleteDoc);

module.exports = router;
