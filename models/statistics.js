// models/Statistic.js
const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Yil kiritilishi shart"],
      min: [2000, "Yil 2000 dan kichik bo‘lmasligi kerak"],
      max: [new Date().getFullYear() + 5, "Kelajakdagi yil juda uzoq"],
      unique: true, // <--- ENG MUHIM!
    },
    students: {
      type: Number,
      required: [true, "O‘quvchilar soni kiritilishi shart"],
      min: [0, "O‘quvchilar soni manfiy bo‘lmasligi kerak"],
      max: [100000, "Juda katta son kiritildi"],
    },
    graduates: {
      type: Number,
      default: 0,
      min: [0],
      validate: {
        validator: function (v) {
          return v <= this.students; // Bitiruvchilar o‘quvchilardan ko‘p bo‘lmasin
        },
        message: "Bitiruvchilar soni jami o‘quvchilardan oshmasligi kerak",
      },
    },
    teachers: {
      type: Number,
      default: 0,
      min: [0],
      max: [5000],
    },

    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "statistics",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        delete ret.createdBy;
        return ret;
      },
    },
  }
);

// === INDEXLAR ===
statisticSchema.index({ year: 1 }, { unique: true }); // Tez qidirish + duplicate oldini olish
statisticSchema.index({ createdAt: -1 });
statisticSchema.index({ isActive: 1 });

// === PRE-SAVE: year ni to‘g‘ri formatda saqlash (ixtiyoriy) ===
statisticSchema.pre("save", function (next) {
  this.year = Number(this.year);
  next();
});

const Statistic = mongoose.model("Statistic", statisticSchema);

module.exports = Statistic;
