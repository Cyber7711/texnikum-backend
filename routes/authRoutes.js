const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// Rate limiter faqat login uchun
const rateLimit = require("express-rate-limit");
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10, // IP bo'yicha cheklov
  message: "IP bloklandi. 15 daqiqadan keyin urining.",
});

router.post("/login", loginLimiter, authController.login);
router.get("/logout", authController.logout);

module.exports = router;
