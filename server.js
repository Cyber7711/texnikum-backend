"use strict";

require("dotenv").config();
require("colors");
const connectDB = require("./src/config/db");
const app = require("./src/app");

// 1. DATABASE CONNECTION
connectDB();

// 2. START SERVER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli ishga tushdi`.cyan.bold);
});

// 3. ERROR HANDLING (Kutilmagan xatolar)
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION! Server yopilmoqda...".red.bold);
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
