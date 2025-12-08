// config/db.js (Yaxshilangan)
const mongoose = require("mongoose");

let retryCount = 0;
const maxRetries = 10;
const retryDelay = 5000;

const connectDB = async () => {
  while (retryCount < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB ulandi: ${conn.connection.host}`.green);

      // Event listenerlar
      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB uzildi. Qayta ulanmoqda...".yellow);
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB qayta ulandi".green);
      });

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB xatosi:".red, err.message);
      });

      return conn;
    } catch (err) {
      retryCount++;
      console.error(
        `❌ Ulanishda xato (${retryCount}/${maxRetries}):`.red,
        err.message
      );

      if (retryCount >= maxRetries) {
        console.error("❌ MongoDB ga ulanish imkonsiz bo‘ldi!".red);
        process.exit(1);
      }

      console.log(
        `⏳ ${retryDelay / 1000} soniyadan keyin qayta urinish...`.yellow
      );
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }
};

module.exports = connectDB;
