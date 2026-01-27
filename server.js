const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
require("colors");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser"); // 🍪 Cookie o'qish uchun
const mongoSanitize = require("express-mongo-sanitize"); // 🛡️ NoSQL Injection
const xss = require("xss-clean"); // 🛡️ XSS himoya
const hpp = require("hpp"); // 🛡️ Parametr ifloslanishi
const compression = require("compression"); // 🚀 Tezlikni oshirish

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const allRoutes = require("./routes/index");
const { swaggerUi, swaggerSpec } = require("./swagger");

dotenv.config();
connectDB();

const app = express();

// ============================================================
// 1. SECURITY & OPTIMIZATION (HIMOYA QATLAMI)
// ============================================================

// Proxy ishonchi (Vercel/Heroku uchun shart)
app.set("trust proxy", 1);

// HTTP Headerlarni himoyalash
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS (Kimlar kira oladi?)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://texnikum3son.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Cookie o'tishi uchun ruxsat
  }),
);

// Response-larni siqish (Sayt tezroq yuklanadi)
app.use(compression());

// ============================================================
// 2. PARSERS (MA'LUMOTNI O'QISH)
// ============================================================

// Body-dagi ma'lumotni o'qish (max 10kb - DDoS himoya)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 🍪 Browserdan kelgan Cookie-ni o'qish (Login uchun eng muhimi!)
app.use(cookieParser());

// ============================================================
// 3. DATA SANITIZATION (TOZALASH)
// ============================================================

// NoSQL Injection himoyasi ($, . belgilarni tozalaydi)
// Siz yozgan qo'lbola funksiyadan ko'ra tezroq va ishonchliroq
app.use(mongoSanitize());

// XSS himoyasi (HTML kodlarni tozalaydi <script>alert(1)</script>)
app.use(xss());

// HPP (HTTP Parameter Pollution)
// Masalan: ?sort=price&sort=name (ikki marta yozishni to'xtatadi)
app.use(hpp());

// ============================================================
// 4. RATE LIMITING (DOS HIMOYA)
// ============================================================

const limiter = rateLimit({
  max: 200, // 15 daqiqada 200 ta so'rov
  windowMs: 15 * 60 * 1000,
  message: "Juda ko'p so'rov yubordingiz. Iltimos 15 daqiqa kuting.",
});

app.use("/api", limiter);

// ============================================================
// 5. ROUTES (YO'NALISHLAR)
// ============================================================

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", allRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Texnikum API Running Security Level: MAX 🛡️");
});

// ============================================================
// 6. ERROR HANDLING
// ============================================================

app.use((req, res, next) => {
  next(new AppError(`Manzil topilmadi: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

// ============================================================
// 7. START
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server ${PORT}-portda xavfsiz rejimda ishga tushdi`.green.bold,
  );
});
