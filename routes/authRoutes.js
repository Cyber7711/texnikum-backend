const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "IP bloklandi. 15 daqiqadan keyin urining.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

// ixtiyoriy: kim login bo‘lganini tekshirish
router.get("/me", authController.protect, authController.me);

module.exports = router;
