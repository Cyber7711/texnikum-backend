// src/app.js
"use strict";

const express = require("express");
const path = require("path");

// Security libraries
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const compression = require("compression");

// Custom middlewares & utils
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const allRoutes = require("./routes/index");
const { honeyPot } = require("./middleware/securityMiddleware");
const xssCleaner = require("./middleware/xss"); // 🚀 Yangi chiqargan faylimiz

const app = express();

// --- 1. NETWORK SECURITY ---
app.set("trust proxy", 1);

// Brauzer xavfsizlik sarlavhalari (Cross-Origin resurslarni o'qiy olishi uchun moslashtirilgan)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Ruxsat berilgan domenlar ro'yxati (oxirida slash '/' bo'lmasligi shart!)
const allowedOrigins = [
  "http://localhost:3000", // Nuxt / Next.js local development
  "http://localhost:5173", // Vite / React local development
  "https://texnikum3son.vercel.app", // 🚀 Sening haqiqiy production frontending
];

app.use(
  cors({
    origin: (origin, cb) => {
      // 1. Agar origin bo'lmasa (Server-to-server, Postman yoki health-check pinglar bo'lsa) ruxsat berish
      // 2. Agar kelayotgan origin ruxsat etilganlar ro'yxatida bo'lsa, ruxsat berish
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // Aks holda so'rovni xavfsizlik yuzasidan rad etish
      return cb(
        new AppError(
          `CORS xatoligi: ${origin} manziliga ruxsat berilmagan`,
          403,
        ),
      );
    },
    credentials: true, // Cookie va JWT tokenlar brauzer va server o'rtasida xavfsiz o'tishi uchun shart!
  }),
);
// --- 2. PERFORMANCE & PARSING ---
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is alive and running smoothly!",
    timestamp: new Date(),
  });
});

// --- 3. DATA SECURITY (Sanitization) ---
app.use(mongoSanitize()); // NoSQL Injection
app.use(xssCleaner); // Cross-site Scripting
app.use(hpp({ whitelist: ["sort", "page", "limit", "category"] })); // HTTP Param Pollution

// --- 4. ACCESS CONTROL (HoneyPot & RateLimit) ---
app.use(honeyPot); // 🚨 Hackerlar uchun tuzoq
app.use("/api", rateLimit({ max: 300, windowMs: 15 * 60 * 1000 }));

// --- 5. ROUTES ---
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api", allRoutes);

// --- 6. ERROR HANDLING ---
app.all("*", (req, res, next) =>
  next(new AppError(`Mavjud emas: ${req.originalUrl}`, 404)),
);
app.use(globalErrorHandler);

module.exports = app;
