// models/News.js
const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Yangilik sarlavhasi kiritilishi shart"],
      trim: true,
      minlength: [5, "Sarlavha kamida 5 belgidan iborat bo‘lishi kerak"],
      maxlength: [150, "Sarlavha 150 belgidan oshmasligi kerak"],
      match: [
        /^[a-zA-Z0-9\s\.\,\-\(\)\!\?а-яА-ЯёЁ№]+$/,
        "Sarlavhada taqiqlangan belgilar bor",
      ],
    },
    content: {
      type: String,
      required: [true, "Yangilik matni kiritilishi shart"],
      trim: true,
      minlength: [20, "Matn kamida 20 belgidan iborat bo‘lishi kerak"],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // yoki "Teacher"
      required: true,
      immutable: true,
      select: false,
    },
    image: {
      type: String, // Cloudinary URL yoki /uploads/news/...
      default: null,
    },
    imagePublicId: {
      type: String, // Cloudinary bo‘lsa public_id saqlash uchun
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: true, // agar false bo‘lsa – faqat admin ko‘radi
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "news",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        delete ret.author;
        delete ret.imagePublicId;

        // Frontend uchun qulay format
        ret.date = ret.date.toLocaleDateString("uz-UZ", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return ret;
      },
    },
  }
);

// === INDEXLAR – JUDA MUHIM! ===
newsSchema.index({ date: -1 }); // Yangi yangiliklar birinchi chiqsin
newsSchema.index({ isActive: 1, isPublished: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ views: -1 }); // Eng ko‘p o‘qilganlar
newsSchema.index({ title: "text", content: "text" }); // Qidiruv uchun ($text)

// === UNIQUE – bir xil sarlavha bo‘lmasin (ixtiyoriy) ===
// newsSchema.index({ title: 1 }, { unique: true });

const News = mongoose.model("News", newsSchema);

module.exports = News;
