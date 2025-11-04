const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username kiritilishi kerak"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Parol kiritilishi kerak"],
    select: false, // parolni defaultda so‘rovda ko‘rsatmaymiz
  },
});

// Parolni saqlashdan oldin hash qilamiz
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Parolni tekshirish uchun method
adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
