const express = require("express");
const router = express.Router();
const docController = require("../controllers/docController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads"); // <--- Multer middleware-ni import qiling

// Jamoat uchun ochiq (Public)
router.get("/", docController.getAll);
router.get("/:id", docController.getById);

// Faqat Adminlar uchun (Protected)
router.use(protect);

// MUHIM: Bu yerda upload.single("file") bo'lishi shart!
router.post("/", upload.single("file"), docController.create);
router.put("/:id", upload.single("file"), docController.update);
router.delete("/:id", docController.deleteDoc);

module.exports = router;
