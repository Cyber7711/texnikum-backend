// createAdmin.js (Production-ready)

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const promptly = require("promptly"); // yoki inquirer
const Admin = require("./models/admin");
const connectDB = require("./config/db");

dotenv.config({ path: ".env" });

const createAdmin = async () => {
  try {
    // Agar argumentlar berilmasa, interaktiv so‘raymiz
    let username = process.argv[2];
    let password = process.argv[3];

    if (!username || !password) {
      console.log("Interaktiv rejim ishga tushdi...\n".cyan);
      username = await promptly.prompt("Username: ");
      password = await promptly.password("Parol: ", { replace: "*" });

      const confirm = await promptly.password("Parolni tasdiqlang: ", {
        replace: "*",
      });
      if (password !== confirm) {
        console.log("❌ Parollar mos kelmadi!".red);
        process.exit(1);
      }
    }

    if (password.length < 8) {
      console.log("❌ Parol kamida 8 belgidan iborat bo‘lishi kerak!".red);
      process.exit(1);
    }

    await connectDB();

    // Eski adminlarni o‘chirishdan oldin ogohlantirish
    const existing = await Admin.countDocuments();
    if (existing > 0) {
      const confirm = await promptly.confirm(
        `⚠️  ${existing} ta admin topildi. Hammasini o‘chirishni xohlaysizmi? (y/N): `
      );
      if (!confirm) {
        console.log("❌ Operatsiya bekor qilindi.".yellow);
        process.exit(0);
      }
      await Admin.deleteMany({});
      console.log("🗑️ Eski adminlar o‘chirildi.".red);
    }

    const admin = await Admin.create({ username, password });
    console.log(
      `✅ Yangi admin muvaffaqiyatli yaratildi: ${admin.username}`.green
    );
    console.log(`🔑 Parol xavfsiz saqlandi (bcrypt hash)`.green);

    await mongoose.connection.close();
    console.log("🔌 MongoDB ulanishi yopildi.".cyan);
    process.exit(0);
  } catch (err) {
    console.error("❌ Xato:".red, err.message);
    process.exit(1);
  }
};

createAdmin();
