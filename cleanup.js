require("dotenv").config(); // 👈 BU QATORNI QO'SHING
const mongoose = require("mongoose");
const Management = require("./models/management");

const MONGO_URI = process.env.MONGO_URL; // Endi bu undefined bo'lmaydi

async function startCleanup() {
  if (!MONGO_URI) {
    console.error("Xato: MONGO_URL topilmadi. .env faylingizni tekshiring!");
    process.exit(1);
  }

  try {
    console.log("Bazaga ulanishga harakat qilinmoqda...");
    await mongoose.connect(MONGO_URI);
    console.log("Baza muvaffaqiyatli ulandi ✅");

    const result = await Management.deleteMany({});
    console.log(
      `Jarayon yakunlandi: ${result.deletedCount} ta ma'lumot tozalandi 🗑️`,
    );
  } catch (error) {
    console.error("Xatolik:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

startCleanup();
