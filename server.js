const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const globalErrorHandler = require("./controllers/errorController");
const authRoutes = require("./routes/authRoutes");
const AppError = require("./utils/appError");

dotenv.config();
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: "10kb" }));

// CORS
app.use(
  cors({
    origin: "https://texnikum.uz",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Security
app.use(hpp());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use("/uploads", express.static("uploads"));

// Dynamic routes
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

// Rate limiter for API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Juda kop surovlar yuborildi, keyinroq qayta urinib koring",
  keyGenerator: (req) => req.ip, // proxy bo‘lsa IP aniqlash
});
app.use("/api", limiter);

// Trust proxy (Railway uchun)
app.set("trust proxy", 1);

// Auth rate limiter
const authLimiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Kop urinish. 15 daqiqadan keyin qayta urinib kuring",
  keyGenerator: (req) => req.ip,
});
app.use("/auth", authLimiter, authRoutes);

// Health check
app.get("/", (req, res) => res.send("Texnikum ishlayapti"));

// Error testing
app.get("/error-test", (req, res, next) => {
  next(new Error("Bu test xato"));
});

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`URL topilmadi: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishga tushdi`));
