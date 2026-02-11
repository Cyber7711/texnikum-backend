const mongoose = require("mongoose");

const managementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    position: { type: String, required: true, trim: true, maxlength: 160 },

    role: {
      type: String,
      enum: ["director", "deputy", "head"],
      required: true,
      index: true,
    },

    phone: { type: String, default: null, trim: true, maxlength: 50 },
    email: { type: String, default: null, trim: true, maxlength: 120 },
    reception: { type: String, default: null, trim: true, maxlength: 120 },
    bio: { type: String, default: null, trim: true, maxlength: 1200 },
    education: { type: String, default: null, trim: true, maxlength: 160 },
    experience: { type: String, default: null, trim: true, maxlength: 80 },

    iconKey: { type: String, default: null, trim: true, maxlength: 50 },

    order: { type: Number, default: 0, index: true },

    // Uploadcare UUID
    image: { type: String, default: null },
    imagePublicId: { type: String, select: false },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      immutable: true,
      select: false,
    },

    isActive: { type: Boolean, default: true, select: false },
  },
  {
    timestamps: true,
    collection: "management",
    // management.js (Model ichida toJSON transform qismi)
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        delete ret.imagePublicId;

        if (ret.image && ret.image.length > 5) {
          const uuid = ret.image;
          ret.imageUrl = `https://ucarecdn.com/${uuid}/`;
          // Preview uchun: smart crop, auto format va quality smart filtrlari qo'shildi
          ret.imagePreview = `https://ucarecdn.com/${uuid}/-/preview/600x600/-/quality/smart/-/format/auto/`;
        } else {
          ret.imageUrl = null;
          ret.imagePreview = null;
        }
        return ret;
      },
    },
  },
);

managementSchema.index({ role: 1, order: 1 });
managementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Management", managementSchema);
