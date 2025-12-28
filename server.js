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
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use(express.json({ limit: "10kb" }));
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://texnikum.uz",
  "https://www.texnikum.uz",
  "https://texnikum-backend.onrender.com", // O'zining linkini ham qo'shib qo'yamiz
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy error"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// 2. Helmet sozlamalarini rasm ko'rinadigan qilib to'g'irlaymiz
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Uploadcare va boshqa rasm manbalariga ruxsat berish
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
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // <--- Rasmlar uchun o'ta muhim
    crossOriginEmbedderPolicy: false, // <--- Ba'zi brauzerlarda blokirovkani yechadi
  })
);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(hpp());

const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
const filtered = routeFiles.filter(
  (f) => f.endsWith("Routes.js") && f !== "authRoutes.js"
);
console.log("Loaded route files:", filtered);

for (const file of filtered) {
  const routeName = file.replace("Routes.js", "");
  const route = require(path.join(routesPath, file));
  app.use(`/${routeName}`, route);
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Juda kop surovlar yuborildi, Keyinroq qayta urinib koring".red,
});
app.use("/api", limiter);
app.set("trust proxy", 1);

const authLimiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Kop urinish.15 daqiqadan keyin qayta urinib kuring".red,
});
app.use("/auth", authLimiter, authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Texnikum ishlayapti",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/error-test", (req, res, next) => {
  next(new Error("Bu test xato"));
});

app.use((err, req, res, next) => {
  console.error("Xatolik:".red, err.stack);
  res.status(500).json({ message: err.message });
});

app.use((req, res, next) => {
  next(new AppError(`URL topilmadi: ${req.originalUrl}`.red, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server ${PORT}-portda ishga tushdi`.green);
});
