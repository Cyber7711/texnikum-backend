const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      required: true,
      enum: ["nizom", "qaror", "buyruq", "metodik"],
    },
    file: { type: String, required: true }, // Supabase Path
    fileType: { type: String, lowercase: true, default: "pdf" },
    fileSize: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    isActive: { type: Boolean, default: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;

        if (ret.file) {
          const supabaseUrl = process.env.SUPABASE_URL;
          // Hujjatni ko'rish yoki yuklab olish havolasi
          ret.fileUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${ret.file}`;
        } else {
          ret.fileUrl = null;
        }
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("Document", documentSchema);
