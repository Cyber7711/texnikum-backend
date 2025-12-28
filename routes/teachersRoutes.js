const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teachersController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads");

// === PUBLIC ROUTES (Hamma ko'ra oladigan) ===
router.get("/", teacherController.getAll);
router.get("/:id", teacherController.getById);

// === PROTECTED ROUTES (Faqat Adminlar uchun) ===
// Yangi yaratish (Rasm yuklash bilan)
router.post(
  "/",
  protect,
  upload.single("image"), // Frontenddan 'image' nomi bilan kelishi shart
  teacherController.create
);

router.delete("/delete-all-danger", teacherController.deleteAll);

// Yangilash
router.put("/:id", protect, upload.single("image"), teacherController.update);

// O'chirish
router.delete("/:id", protect, teacherController.deleteTeacher);

module.exports = router;
