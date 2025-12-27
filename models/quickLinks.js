// models/quickLinks.js
const mongoose = require("mongoose");

const quickLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Havola sarlavhasi kiritilishi shart"],
      trim: true,
      maxlength: [50, "Sarlavha 50 belgidan oshmasligi kerak"],
    },
    url: {
      type: String,
      required: [true, "Havola manzili (URL) kiritilishi shart"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Ikonka nomi kiritilishi shart (masalan: Users, Globe)"],
      default: "Link",
    },
    isExternal: {
      type: Boolean,
      default: false, // Sayt ichidagi yoki tashqi havola ekanligi
    },
    order: {
      type: Number,
      default: 0, // Tugmalar ketma-ketligini boshqarish uchun
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "quicklinks",
  }
);

// Qidiruv va saralashni tezlashtirish uchun indeks
quickLinkSchema.index({ order: 1 });

module.exports = mongoose.model("QuickLink", quickLinkSchema);
