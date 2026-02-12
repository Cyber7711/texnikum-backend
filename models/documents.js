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
    // Uploadcare UUID
    file: {
      type: String,
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
    toJSON: {
      virtuals: true,
      // ⚠️ YANGI QO'SHILGAN QISM
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        // delete ret.createdBy; // Agar admin ma'lumoti kerak bo'lmasa oching

        // UUID dan to'liq yuklab olish havolasini yasash
        if (ret.file) {
          const uuid = ret.file.trim();
          const domain = "5nezpc68d1.ucarecd.net"; // Sizning shaxsiy domeningiz

          // Hujjatni ochish/yuklab olish uchun toza havola
          // Oxirida slesh (/) bo'lishi shart!
          ret.fileUrl = `https://${domain}/${uuid}/`;

          // Ixtiyoriy: Faylni brauzerda ochmasdan, to'g'ridan-to'g'ri "Skachat" qilish uchun
          ret.downloadUrl = `https://${domain}/${uuid}/-/inline/no/`;
        } else {
          ret.fileUrl = null;
          ret.downloadUrl = null;
        }

        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

module.exports = mongoose.model("Document", documentSchema);
