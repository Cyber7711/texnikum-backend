const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
require("colors");
const cors = require("cors");
// const mongoSanitize = require("express-mongo-sanitize"); // <-- BUNI O'CHIRDIK (Xato manbai)
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
// const hpp = require("hpp"); // <-- BUNI HAM O'CHIRDIK

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const allRoutes = require("./routes/index");
const { swaggerUi, swaggerSpec } = require("./swagger");

dotenv.config();
connectDB();

const app = express();

// ============================================================
// 1. GLOBAL SECURITY
// ============================================================

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://texnikum3son.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`.red);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ============================================================
// 2. PARSERS
// ============================================================

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ============================================================
// 3. MANUAL SANITIZATION (QO'LBOLA TOZALASH - XATOSIZ)
// ============================================================

// Biz 'express-mongo-sanitize' o'rniga o'zimizning middleware'ni yozamiz.
// Bu req.query yoki req.body ni ALMASHTIRMAYDI, shunchaki ichini tekshiradi.
app.use((req, res, next) => {
  const clean = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        clean(obj[key]); // Rekursiya
      } else if (typeof key === "string" && key.startsWith("$")) {
        // Agar kalit '$' bilan boshlansa (masalan $gt), uni o'chiramiz
        delete obj[key];
      }
    }
  };

  if (req.body) clean(req.body);
  // req.query-ni o'zgartirishga urinmaymiz, faqat ichidagi zararli qismlarni o'chiramiz
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);

  next();
});

// ============================================================
// 4. RATE LIMITING
// ============================================================

const limiter = rateLimit({
  max: 150,
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message: "Juda ko'p so'rov. 15 daqiqadan keyin urinib ko'ring.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// ============================================================
// 5. ROUTES
// ============================================================

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", allRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Texnikum API ishlayapti",
  });
});

// ============================================================
// 6. ERROR HANDLING
// ============================================================

app.use((req, res, next) => {
  next(new AppError(`Manzil topilmadi: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

// ============================================================
// 7. START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishga tushdi`.green.bold);
});
