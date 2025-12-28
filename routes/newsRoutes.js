const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const upload = require("../middleware/uploads"); // Sizning Multer sozlangan faylingiz
const { protect } = require("../middleware/protect"); // Admin himoyasi bo'lsa

router.route("/").get(newsController.getAllNews).post(
  protect,
  upload.single("image"), // 'image' nomli faylni RAM'ga yuklaydi
  newsController.createNews
);

router
  .route("/:id")
  .get(newsController.getNewsById)
  .patch(
    protect,

    upload.single("image"),
    newsController.updateNews
  )
  .delete(protect, newsController.deleteNews);

module.exports = router;
