const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teachersController");
const { protect } = require("../middleware/protect");
const upload = require("../middleware/uploads"); 

router.post(
  "/",
  protect,
  upload.single("image"), // Frontendda 'image' deb kelishi shart
  teacherController.create
);

// GET: Hammasini olish
router.get("/", teacherController.getAll);

// GET: Bitta olish
router.get("/:id", teacherController.getById);

// PUT: Yangilash
router.put("/:id", protect, upload.single("image"), teacherController.update);

// DELETE: O'chirish
router.delete("/:id", protect, teacherController.deleteTeacher);

module.exports = router;
