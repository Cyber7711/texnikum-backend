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
      ref: "Admin",
      required: true,
      immutable: true,
      select: false,
    },
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
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

        // MUHIM: UUIDdan to'g'ri URL yasash
        if (ret.image && ret.image.length > 5) {
          const uuid = ret.image;
          // Asil URL (Oxirida slesh bo'lishi shart!)
          ret.imageUrl = `https://ucarecdn.com/${uuid}/`;
          // Preview (Parametrlar va sleshlarning tartibi muhim)
          ret.imagePreview = `https://ucarecdn.com/${uuid}/-/preview/400x400/-/quality/smart/`;

          // Agar bazadagi UUIDni o'zini frontendga yubormoqchi bo'lmasangiz:
          // delete ret.image;
        } else {
          ret.imageUrl = null;
          ret.imagePreview = null;
        }

        ret.date = ret.date
          ? ret.date.toLocaleDateString("uz-UZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;

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
