const mongoose = require("mongoose");
const validator = require("validator"); // Validator kutubxonasi yordam beradi

const applicantSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Ism kiritilishi shart"],
      trim: true,
      minlength: [5, "Ism-familiya kamida 5 ta harfdan iborat bo'lishi kerak"],
    },
    phone: {
      type: String,
      required: [true, "Telefon raqami kiritilishi shart"],
      unique: true, // Bazada takrorlanishni taqiqlaydi
      trim: true, // Bo'shliqlarni olib tashlaydi
      lowercase: true, // Har doim bir xil formatda saqlash uchun
    },
    direction: {
      type: String,
      required: [true, "Yo'nalishni tanlash shart"],
    },
    status: {
      type: String,
      enum: ["yangi", "bog'lanildi", "qabul", "rad"],
      default: "yangi",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexlar - Ma'lumot qidirishni tezlashtiradi
applicantSchema.index({ phone: 1 });

module.exports = mongoose.model("Applicant", applicantSchema);
