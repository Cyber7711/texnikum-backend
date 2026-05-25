const mongoose = require("mongoose");

let retryCount = 0;
const maxRetries = 10;
const retryDelay = 5000;

const connectDB = async () => {
  try {
    // Yangi drayverda faqat Timeout sozlamalari qolsa kifoya
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`.green);

    // Listenerlarni faqat bir marta o'rnatish
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB uzildi. Qayta ulanmoqda...".yellow);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB xatosi:".red, err.message);
    });

    return conn;
  } catch (err) {
    if (retryCount < maxRetries) {
      retryCount++;
      console.error(
        `❌ Ulanishda xato (${retryCount}/${maxRetries}):`.red,
        err.message
      );
      console.log(
        `⏳ ${retryDelay / 1000} soniyadan keyin qayta urinish...`.yellow
      );

      await new Promise((res) => setTimeout(res, retryDelay));
      return connectDB(); // Rekursiv chaqirish
    } else {
      console.error("❌ MongoDB ga ulanish imkonsiz bo‘ldi!".red);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
