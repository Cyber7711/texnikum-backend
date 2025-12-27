// models/documents.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hujjat sarlavhasi kiritilishi shart"],
      trim: true,
      minlength: [3, "Sarlavha kamida 3 belgidan iborat bo‘lishi kerak"],
      maxlength: [150, "Sarlavha 150 belgidan oshmasligi kerak"],
    },
    category: {
      type: String,
      required: [true, "Kategoriya tanlanishi shart"],
      enum: ["nizom", "qaror", "buyruq", "metodik"], // Frontenddagi variantlar bilan mos
      trim: true,
    },
    file: {
      type: String, // Fayl yo'li (path)
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
      max: [20 * 1024 * 1024, "Fayl hajmi 20 MB dan oshmasligi kerak"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Yoki "User", tizimingizdagi admin model nomiga qarab
      required: true,
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
  }
);

// Indekslar
documentSchema.index({ title: 1 });
documentSchema.index({ category: 1 }); // Kategoriya bo'yicha qidiruv uchun
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
