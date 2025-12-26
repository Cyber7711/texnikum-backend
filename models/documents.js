// models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hujjat sarlavhasi kiritilishi shart"],
      trim: true,
      minlength: [3, "Sarlavha kamida 3 belgidan iborat bo‘lishi kerak"],
      maxlength: [150, "Sarlavha 150 belgidan oshmasligi kerak"],
      match: [
        /^[a-zA-Z0-9\s\(\)\-\_\.а-яА-ЯёЁ]+$/,
        "Sarlavhada taqiqlangan belgilar bor",
      ],
    },
    file: {
      type: String,
      required: [true, "Fayl yuklanishi shart"],
      trim: true,
    },
    fileType: {
      type: String,
      enum: [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "jpg",
        "jpeg",
        "png",
        "txt",
        "zip",
        "rar",
      ],
      required: [true, "Fayl turi aniqlanishi kerak"],
    },
    fileSize: {
      type: Number, // byte da
      max: [20 * 1024 * 1024, "Fayl hajmi 20 MB dan oshmasligi kerak"], // 20 MB limit
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      immutable: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "documents",
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

// === INDEXLAR – JUDA MUHIM! ===
documentSchema.index({ title: 1 });
documentSchema.index({ fileType: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ isActive: 1 });
documentSchema.index({ createdBy: 1 });

// === UNIQUE + COMPOUND INDEX (title + file) ===
documentSchema.index({ title: 1, fileType: 1 }, { unique: true });

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
