const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hujjat sarlavhasi kiritilishi shart"],
      trim: true,
      maxlength: [200, "Sarlavha 200 belgidan oshmasligi kerak"],
    },
    category: {
      type: String,
      required: [true, "Kategoriya tanlanishi shart"],
      enum: {
        values: ["nizom", "qaror", "buyruq", "metodik"],
        message: "Kategoriya noto'g'ri tanlandi",
      },
    },
    file: {
      type: String, // Uploadcare UUID
      required: [true, "Fayl UUID kiritilishi shart"],
    },
    fileType: {
      type: String,
      lowercase: true,
      default: "pdf",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Hujjat egasi (Admin) ko'rsatilishi shart"],
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Document", documentSchema);
