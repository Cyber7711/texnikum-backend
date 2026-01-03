const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
require("colors");
const corsMiddleware = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const path = require("path");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const allRoutes = require("./routes/index");
const { swaggerUi, swaggerSpec } = require("./swagger");

dotenv.config();
connectDB();

const app = express();

// 1. GLOBAL SECURITY MIDDLEWARES
app.set("trust proxy", 1);

// Helmet - HTTP sarlavhalarini himoya qilish
app.use(helmet());

// CORS sozlamalari
const allowedOrigins = [
  "http://localhost:5173",
  "https://texnikum3son.vercel.app",
];

app.use(
  corsMiddleware({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new AppError(`CORS tomonidan bloklandi: ${origin}`, 403));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. BODY PARSERS (Tartib muhim!)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 3. DATA SANITIZATION
// NoSQL Injection himoyasi
app.use(mongoSanitize());

// HPP - Parameter Pollution himoyasi (Xatoni oldini olish uchun body va query'dan keyin qo'yiladi)
app.use(hpp());

// 4. RATE LIMITING
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message:
    "Siz juda ko'p so'rov yubordingiz. Iltimos, 15 daqiqadan so'ng urinib ko'ring.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// 5. CENTRALIZED ROUTES
app.use("/api/v1", allRoutes);

// Swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Asosiy tekshiruv
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Texnikum API ishlayapti" });
});

// 6. ERROR HANDLING
app.use((req, res, next) => {
  next(
    new AppError(`${req.originalUrl} manzili ushbu serverda topilmadi!`, 404)
  );
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Secure Server running on port ${PORT}`.cyan.bold);
});
