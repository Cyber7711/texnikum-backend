const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
require("colors");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const globalErrorHandler = require("./controllers/errorController");
const authRoutes = require("./routes/authRoutes");
const AppError = require("./utils/appError");
const { swaggerUi, swaggerSpec } = require("./swagger");

dotenv.config();
connectDB();

const app = express();

// 1. TRUST PROXY - Har doim eng tepada bo'lishi kerak (Render/Vercel uchun)
app.set("trust proxy", 1);

// 2. HELMET (CORS dan oldin yoki keyin, lekin routelardan oldin)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://ucarecdn.com",
          "https://*.uploadcare.com",
        ],
        connectSrc: [
          "'self'",
          "https://ucarecdn.com",
          "https://*.uploadcare.com",
          "https://texnikum-backend.onrender.com",
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// 3. CORS - To'g'ri sozlangan linklar bilan
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://texnikum3son.vercel.app",
  "https://texnikum-backend.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Brauzerdan bo'lmagan so'rovlarga (Postman/Server) ruxsat
      if (!origin) return callback(null, true);

      // 2. Kelayotgan origin oxiridagi sleshni olib tashlab tekshirish
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;

      if (allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        // MUHIM: Qaysi manzil bloklanayotganini Render logida ko'rish uchun:
        console.error(`❌ CORS Bloklandi. Kelgan manzil: ${origin}`.red);
        callback(new Error("CORS policy error"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(hpp());

// 4. RATE LIMITER - Routelardan oldin e'lon qilinishi kerak
const limiter = rateLimit({
  max: 200, // Limitni biroz oshirdik
  windowMs: 60 * 60 * 1000,
  message: "Juda ko'p so'rov yuborildi, keyinroq qayta urinib ko'ring".red,
});
// Faqat /api bilan boshlanadigan yo'llarga qo'llaymiz
app.use("/api", limiter);

// 5. ROUTES - Dinamik yuklash
const routesPath = path.join(__dirname, "routes");
if (fs.existsSync(routesPath)) {
  const routeFiles = fs.readdirSync(routesPath);
  const filtered = routeFiles.filter(
    (f) => f.endsWith("Routes.js") && f !== "authRoutes.js"
  );

  filtered.forEach((file) => {
    const routeName = file.replace("Routes.js", "").toLowerCase();
    const route = require(path.join(routesPath, file));
    app.use(`/api/${routeName}`, route); // Standart bo'yicha /api/ qo'shildi
  });
}

// 6. AUTH ROUTES
const authLimiter = rateLimit({
  max: 20, // Test vaqti ko'proq imkoniyat
  windowMs: 15 * 60 * 1000,
  message: "Ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring".red,
});
app.use("/api/auth", authLimiter, authRoutes);

// Swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Asosiy tekshiruv yo'li
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Texnikum API ishlayapti" });
});

app.use((req, res, next) => {
  next(new AppError(`URL topilmadi: ${req.originalUrl}`.red, 404));
});
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishga tushdi`.green);
});
