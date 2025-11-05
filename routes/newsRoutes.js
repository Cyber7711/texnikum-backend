const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const findById = require("../middleware/findById");
const News = require("../models/news");
const newsController = require("../controllers/newsController");
const { protect } = require("../middleware/protect");

router.post("/", protect, upload.single("image"), newsController.createNews);
router.get("/", newsController.getAllNews);
router.get("/:id", findById(News), newsController.getNewsById);
router.put("/:id", protect, findById(News), newsController.updateNews);
router.delete("/:id", protect, findById(News), newsController.deleteNews);

module.exports = router;
