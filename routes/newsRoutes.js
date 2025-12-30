const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const upload = require("../middleware/uploads"); // MemoryStorage versiyasi
const { protect } = require("../middleware/protect");

// === PUBLIC ROUTES (Hamma ko'ra oladi) ===
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);

// === PROTECTED ROUTES (Faqat Admin) ===
router.post(
  "/",
  protect,
  upload.single("image"), // Frontendda formData.append('image', file) bo'lishi kerak
  newsController.createNews
);

router.patch(
  "/:id",
  protect,
  upload.single("image"),
  newsController.updateNews
);

router.delete("/:id", protect, newsController.deleteNews);

module.exports = router;
