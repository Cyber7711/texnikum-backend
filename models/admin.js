// models/admin.js (Yaxshilangan versiya)
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator"); // Qo‘shish kerak!

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username kiritilishi shart"],
      unique: true,
      trim: true,
      minlength: [4, "Username kamida 4 belgidan iborat bo‘lishi kerak"],
      maxlength: [20, "Username 20 belgidan oshmasligi kerak"],
      validate: {
        validator: (v) =>
          validator.isAlphanumeric(v) &&
          validator.isLength(v, { min: 4, max: 20 }),
        message: "Username faqat harf va raqamlardan iborat bo‘lishi kerak",
      },
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi shart"],
      minlength: [8, "Parol kamida 8 belgidan iborat bo‘lishi kerak"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Parolni hash qilish
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Parolni tekshirish
adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Parolni o‘zgartirish vaqti
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
