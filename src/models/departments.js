// models/Department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Bo‘lim nomi kiritilishi shart"],
      trim: true,
      unique: true, // <--- Eng muhim!
      minlength: [2, "Nomi kamida 2 belgidan iborat bo‘lishi kerak"],
      maxlength: [100, "Nomi 100 belgidan oshmasligi kerak"],
      match: [
        /^[a-zA-Z0-9\s\(\)\-\.]+$/,
        "Nomi faqat harf, raqam va oddiy belgilar bo‘lishi mumkin",
      ],
    },
    desc: {
      type: String,
      required: [true, "Tavsif kiritilishi shart"],
      trim: true,
      minlength: [10, "Tavsif kamida 10 belgidan iborat bo‘lishi kerak"],
      maxlength: [1000, "Tavsif 1000 belgidan oshmasligi kerak"],
    },
    duration: {
      type: Number,
      required: [true, "O‘qish muddati (oy) kiritilishi shart"],
      min: [1, "Muddati kamida 1 oy bo‘lishi kerak"],
      max: [120, "Muddati 120 oydan oshmasligi kerak"],
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      select: false, // Admin panelida ko‘rsatish kerak bo‘lsa .select('isActive') qilamiz
    },
  },
  {
    timestamps: true,
    collection: "departments", // agar collection nomi kichik harfda bo‘lishini xohlasangiz
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive; // oddiy foydalanuvchiga ko‘rinmasin
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// === INDEXLAR – JUDA MUHIM! ===
departmentSchema.index({ name: 1 }); // Tez qidirish
departmentSchema.index({ teachers: 1 }); // Teacher bo‘yicha filter
departmentSchema.index({ courses: 1 }); // Course bo‘yicha filter
departmentSchema.index({ isActive: 1 }); // Faol bo‘limlarni tez olish
departmentSchema.index({ createdAt: -1 }); // Yangi bo‘limlar birinchi chiqsin

// Agar o‘chirilganda referenslar ham tozalanmoqchi bo‘lsa (ixtiyoriy)
// departmentSchema.pre('remove', async function (next) { ... })

const Department = mongoose.model("Department", departmentSchema); // singular!

module.exports = Department;
