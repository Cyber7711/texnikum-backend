const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const Admin = require("./models/admin");
const connectDB = require("./config/db"); // avval sizning connectDB faylingiz

dotenv.config();

(async () => {
  try {
    const [username, password] = process.argv.slice(2);

    if (!username || !password) {
      console.log("Usage: node createAdmin.js <username> <password>");
      process.exit(1);
    }

    await connectDB();

    const allAdmins = await Admin.find();
    if (allAdmins.length > 0) {
      console.log("⚠️ Eski admin topildi, o‘chirilmoqda...".yellow);
      await Admin.deleteMany({});
      console.log("🗑️ Eski admin(lar) o‘chirildi.".red);
    }

    const admin = await Admin.create({ username, password });
    console.log(`✅ Yangi admin yaratildi: ${admin.username}`.green);

    await mongoose.connection.close();
    console.log("🔌 MongoDB ulanishi yopildi".yellow);

    process.exit(0);
  } catch (err) {
    console.error("❌ Xato:", err.message || err);
    process.exit(1);
  }
})();
