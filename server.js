const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
require("colors"); // Loglar rangli chiqishi uchun
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const hpp = require("hpp"); // Agar xato bersa, buni o'chiramiz

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const allRoutes = require("./routes/index"); // Markaziy marshrutlar
const { swaggerUi, swaggerSpec } = require("./swagger");

// Muhit o'zgaruvchilarini yuklash
dotenv.config();

// Bazaga ulanish
connectDB();

const app = express();

// ============================================================
// 1. GLOBAL SECURITY VA SOZLAMALAR
// ============================================================

// Trust Proxy (Render/Heroku/Vercel uchun muhim)
app.set("trust proxy", 1);

// Helmet - HTTP sarlavhalarini himoyalaydi
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Rasmlar ko'rinishi uchun
  })
);

// CORS Sozlamalari
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://texnikum3son.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman yoki Server-to-Server so'rovlar uchun (!origin) ruxsat beramiz
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`.red);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================================
// 2. PARSERS (BU YERDA TARTIB O'TA MUHIM)
// ============================================================

// Body parser - JSON ma'lumotlarni o'qish (limit 10kb)
app.use(express.json({ limit: "10kb" }));

// URL Encoded parser - Form ma'lumotlarini o'qish
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ============================================================
// 3. SANITIZATION (TOZALASH)
// ============================================================

// NoSQL Injection himoyasi (req.body, req.query va req.params ni tozalaydi)
// Masalan: email: {"$gt": ""} kabi hujumlarni oldini oladi
app.use(mongoSanitize());

// HPP - Parameter Pollution himoyasi
// DIQQAT: Agar yana "Cannot set property query" xatosi chiqsa,
// pastdagi app.use(hpp()) qatorini o'chirib tashlang.
// app.use(hpp());

// ============================================================
// 4. RATE LIMITING (SPAM HIMOYASI)
// ============================================================

const limiter = rateLimit({
  max: 150, // 15 daqiqada 150 ta so'rov
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message:
      "Juda ko'p so'rov yuborildi. Iltimos, 15 daqiqadan so'ng urinib ko'ring.",
  },
  standardHeaders: true, // RateLimit-* headerlarini qaytarish
  legacyHeaders: false, // X-RateLimit-* headerlarini o'chirish
});

// Rate limiterni faqat /api yo'llariga qo'llash
app.use("/api", limiter);

// ============================================================
// 5. ROUTES (MARSHRUTLAR)
// ============================================================

// Swagger hujjatlari
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Asosiy API yo'llari (v1 versiyasi)
app.use("/api/v1", allRoutes);

// Server ishlashini tekshirish uchun oddiy yo'l
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Texnikum API tizimi barqaror ishlamoqda",
    timestamp: new Date(),
  });
});

// ============================================================
// 6. ERROR HANDLING (XATOLIKLAR)
// ============================================================

// Topilmagan yo'llar uchun (404)
app.use((req, res, next) => {
  next(new AppError(`Ushbu manzil topilmadi: ${req.originalUrl}`, 404));
});

// Global xatolarni ushlab olish
app.use(globalErrorHandler);

// ============================================================
// 7. SERVERNI ISHGA TUSHIRISH
// ============================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli ishga tushdi`.cyan.bold);
});
