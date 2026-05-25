const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username kiritilishi shart"],
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 20,
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
      minlength: 8,
      select: false,
    },

    // bitta admin bo'lsa ham qoldirsang bo'ladi (kelajak uchun)
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    passwordChangedAt: { type: Date },

    // Lockout
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // ✅ refresh token rotation uchun: hashed tokenlar ro‘yxati
    refreshTokens: { type: [String], default: [], select: false },

    createdAt: { type: Date, default: Date.now, select: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Hash password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    // token iat bilan to'qnashmasin
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

adminSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return JWTTimestamp < changedTimestamp;
};

// ✅ refresh token hash helper
adminSchema.methods.hashToken = function (token) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = mongoose.model("Admin", adminSchema);
