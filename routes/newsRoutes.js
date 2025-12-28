const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const upload = require("../middleware/uploads"); // Sizning Multer sozlangan faylingiz
const { protect, restrictTo } = require("../middleware/authMiddleware"); // Admin himoyasi bo'lsa

router.route("/").get(newsController.getAllNews).post(
  protect,
  restrictTo("admin"),
  upload.single("image"), // 'image' nomli faylni RAM'ga yuklaydi
  newsController.createNews
);

router
  .route("/:id")
  .get(newsController.getNewsById)
  .patch(
    protect,
    restrictTo("admin"),
    upload.single("image"),
    newsController.updateNews
  )
  .delete(protect, restrictTo("admin"), newsController.deleteNews);

module.exports = router;
