const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teachersController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads");

// === PUBLIC ROUTES ===
router.get("/", teacherController.getAll);
router.get("/:id", teacherController.getById);

// === PROTECTED ROUTES (Faqat Adminlar uchun) ===
// Yangi o'qituvchi qo'shish
router.post(
  "/",
  protect,
  upload.single("photo"), // 'photo' nomi bilan kelishi tavsiya etiladi
  teacherController.create
);

// O'qituvchi ma'lumotlarini yangilash
router.patch("/:id", protect, upload.single("photo"), teacherController.update);

// O'chirish
router.delete("/:id", protect, teacherController.deleteTeacher);

// Xavfli: Bazani tozalash (faqat test rejimida)
// router.delete("/delete-all-danger", protect, teacherController.deleteAll);

module.exports = router;
