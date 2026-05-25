const AppError = require("../utils/appError");

const TRAP_PATHS = [
  "/admin",
  "/wp-admin",
  "/config",
  "/.env",
  "/.git",
  "/phpmyadmin",
  "/setup.php",
  "/backup",
  "/server-status",
  "/api/v1/auth/login",
];

exports.honeyPot = (req, res, next) => {
  const path = req.originalUrl.toLowerCase();

  // 1. Tekshirish: So'rov tuzoq yo'llaridan biriga tegishlimi?
  const isTrap = TRAP_PATHS.some((trap) => path.includes(trap));

  if (isTrap) {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Loglash (Monitoring uchun)
    console.warn(
      `[SECURITY ALERT] 🚨 IP: ${ip} tuzoqqa tushdi! Path: ${path}`.red.bold,
    );

    // 2. Tarpitting (Kechiktirish): 15-20 soniya kutish
    // Bu xakerning avtomatlashtirilgan skanerlarini juda sekinlashtiradi
    return setTimeout(() => {
      // 3. Javob: 404 qaytaramiz (Go'yoki bunday sahifa yo'qdek)
      return next(new AppError("Sahifa topilmadi", 404));
    }, 15000);
  }

  // Agar tuzoq bo'lmasa, keyingi middleware ga o'tadi
  next();
};
