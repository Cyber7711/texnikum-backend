const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const csrf = require("../middleware/csrf");
const { protect } = require("../middleware/protect");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "IP bloklandi. 15 daqiqadan keyin urining.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF token berish
router.get("/csrf", csrf.csrfToken);

router.post("/login", loginLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

router.get("/me", protect, authController.me);

module.exports = router;
