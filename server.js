// app.js
// ⚠️ MUHIM: dotenv hamma narsadan oldin yuklanishi shart!
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
require("colors");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const hpp = require("hpp");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const allRoutes = require("./routes/index");
const { swaggerUi, swaggerSpec } = require("./swagger");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Xavfsiz tozalash middleware'i
const xssCleaner = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") return DOMPurify.sanitize(obj);
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

// ⚙️ KONFIGURATSIYA
connectDB();

const app = express();

// ============================================================
// 1. GLOBAL MIDDLEWARES & OPTIMIZATION
// ============================================================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  "https://texnikum3son.vercel.app",
  "https://www.texnikum3son.vercel.app",
]);

const vercelPreviewRegex =
  /^https:\/\/(www\.)?texnikum3son(?:-[a-z0-9-]+)?\.vercel\.app$/i;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin) || vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }
    console.log("CORS blocked origin:", origin);
    return callback(new Error("CORS Policy: Bu domenga ruxsat berilmagan!"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(compression());

// ============================================================
// 2. PARSERS & LIMITS (BODY & COOKIE)
// ============================================================

// ⚠️ TO'G'RILANDI: Ikkala limit ham 10MB qilib qo'yildi (rasm/fayl upload uchun)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CSRF Protect vaqtinchalik o'chirib turilishi mumkin, agar muammo tug'dirsa
const { csrfProtect } = require("./middleware/csrf");
app.use(csrfProtect);

// ============================================================
// 3. DATA SANITIZATION
// ============================================================
app.use(mongoSanitize());
app.use(xssCleaner);
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// ============================================================
// 4. RATE LIMITING
// ============================================================
const globalLimiter = rateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message: "Juda ko'p so'rov yubordingiz. 15 daqiqa kuting!",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// ============================================================
// 5. ROUTES
// ============================================================
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", allRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Texnikum API 🛡️ Security Level: MAX (Online)",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 6. ERROR HANDLING
// ============================================================
app.use((req, res, next) => {
  next(new AppError(`Topilmadi: ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

// ============================================================
// 7. BOOTSTRAP
// ============================================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 API System Secured & Running on Port ${PORT}`.cyan.bold);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Server to'xtatilmoqda...".red.bold);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
