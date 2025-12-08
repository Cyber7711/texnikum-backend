const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Sarlavha kiritilishi shart"],
      trim: true,
      minlength: [3, "Sarlavha kamida 3 belgidan iborat bo‘lishi kerak"],
      maxlength: [100, "Sarlavha 100 belgidan oshmasligi kerak"],
      unique: true, // Duplicate sarlavhalar bo‘lmasin
      match: [
        /^[a-zA-Z0-9\s.,!?()'-]+$/,
        "Sarlavhada faqat harf, raqam va oddiy belgilar bo‘lishi mumkin",
      ], // Regex: spam/oldin oldini olish
    },
    description: {
      type: String,
      required: [true, "Tavsif kiritilishi shart"],
      trim: true,
      minlength: [10, "Tavsif kamida 10 belgidan iborat bo‘lishi kerak"],
      match: [
        /^[a-zA-Z0-9\s.,!?()'-]+$/,
        "Tavsifda faqat harf, raqam va oddiy belgilar bo‘lishi mumkin",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    expireDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > this.date;
        },
        message: "Expire date e’lon sanasidan keyin bo‘lishi kerak",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Admin modeliga bog‘lash
      required: true,
      immutable: true,
      select: false, // Defaultda ko‘rinmasin
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "coach"], // Kelajakda kengaytirish uchun
      default: "admin",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.createdBy; // Maxfiy ma’lumotni o‘chirish
        return ret;
      },
    },
  }
);

// Indexlar: tez query uchun
announcementSchema.index({ date: -1 }); // Yangi e’lonlar birinchi chiqsin
announcementSchema.index({ isActive: 1, expireDate: 1 }); // Faol va muddati o‘tmaganlarni tez topish
announcementSchema.index({ role: 1 }); // Role bo‘yicha filter

// Pre-save hook: expireDate avto-deactivate
announcementSchema.pre("save", function (next) {
  if (this.expireDate && this.expireDate < new Date()) {
    this.isActive = false;
  }
  next();
});

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
