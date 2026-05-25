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
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, cb) => {
      // Sizning allowedOrigins mantiqingiz...
      cb(null, true);
    },
    credentials: true,
  }),
);

// --- 2. PERFORMANCE & PARSING ---
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

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
