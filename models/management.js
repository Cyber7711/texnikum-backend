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
    phone: { type: String, default: null, trim: true },
    email: { type: String, default: null, trim: true },
    reception: { type: String, default: null, trim: true },
    bio: { type: String, default: null, trim: true },
    education: { type: String, default: null, trim: true },
    experience: { type: String, default: null, trim: true },
    iconKey: { type: String, default: null, trim: true },
    order: { type: Number, default: 0, index: true },
    image: { type: String, default: null },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      select: false,
    },
    isActive: { type: Boolean, default: true, select: false },
  },
  {
    timestamps: true,
    collection: "management",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;

        if (ret.image) {
          const supabaseUrl = process.env.SUPABASE_URL;
          ret.imageUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${ret.image}`;
        } else {
          ret.imageUrl = null;
        }
        return ret;
      },
    },
  },
);

managementSchema.index({ role: 1, order: 1 });
module.exports = mongoose.model("Management", managementSchema);
