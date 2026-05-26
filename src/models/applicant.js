const mongoose = require("mongoose");
const validator = require("validator"); // Validator kutubxonasi yordam beradi

// Normalize phone: keep leading + then digits, otherwise only digits
const normalizePhone = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  const hasPlus = s.startsWith("+");
  const digits = s.replace(/[^0-9]/g, "");
  return hasPlus ? `+${digits}` : digits;
};

const applicantSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Ism kiritilishi shart"],
      trim: true,
      minlength: [3, "Ism-familiya kamida 3 ta harfdan iborat bo'lishi kerak"],
    },
    phone: {
      type: String,
      required: [true, "Telefon raqami kiritilishi shart"],
      unique: true, // Bazada takrorlanishni taqiqlaydi
      trim: true,
      set: normalizePhone,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return /^(\+)?[0-9]{9,15}$/.test(v);
        },
        message: "Noto'g'ri telefon raqami format",
      },
    },
    direction: {
      type: String,
      required: [true, "Yo'nalishni tanlash shart"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["yangi", "bog'lanildi", "qabul", "rad"],
      default: "yangi",
    },
    ip: {
      type: String,
      select: false,
    },
    userAgent: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexlar - Ma'lumot qidirishni tezlashtiradi
applicantSchema.index({ phone: 1 }, { unique: true });

// Ensure phone is normalized on updates via findOneAndUpdate
applicantSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (!update) return next();
  if (update.phone) update.phone = normalizePhone(update.phone);
  if (update.$set && update.$set.phone)
    update.$set.phone = normalizePhone(update.$set.phone);
  next();
});

module.exports = mongoose.model("Applicant", applicantSchema);
