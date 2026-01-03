const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("colors"); // logs uchun
const corsMiddleware = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const path = require("path");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const allRoutes = require("./routes/index"); // Markaziy marshrutlar
const { swaggerUi, swaggerSpec } = require("./swagger");

dotenv.config();
connectDB();

const app = express();

// 1. GLOBAL SECURITY MIDDLEWARES
app.set("trust proxy", 1);
app.use(helmet()); // Content Security Policy va barcha HTTP header xavfsizligi

// CORS sozlamalari (Faqat xavfsiz manzillar uchun)
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

// 2. DATA PROTECTION
app.use(express.json({ limit: "10kb" })); // Katta hajmli JSON hujumlaridan himoya
app.use(mongoSanitize()); // NoSQL Injection himoyasi (masalan: {"$gt": ""})
app.use(xss()); // Cross-Site Scripting hujumlaridan himoya
app.use(hpp()); // HTTP Parameter Pollution himoyasi

// 3. RATE LIMITING (Spam va DoS himoyasi)
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 daqiqada har bir IP uchun 100 so'rov
  message:
    "Siz juda ko'p so'rov yubordingiz. Iltimos, 15 daqiqadan so'ng urinib ko'ring.",
});
app.use("/api", limiter);

// 4. CENTRALIZED ROUTES
app.use("/api/v1", allRoutes); // Barcha yo'llar bitta joydan (/api/v1/auth, /api/v1/applicant va h.k.)

// Swagger va static yo'llar
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. ERROR HANDLING
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
