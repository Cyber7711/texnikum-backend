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
      select: false,
    },
    image: {
      type: String,
      default: null,
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

        // Supabase URL yasash
        if (ret.image) {
          const supabaseUrl = process.env.SUPABASE_URL;
          ret.imageUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${ret.image}`;
        } else {
          ret.imageUrl = null;
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
  },
);

newsSchema.index({ date: -1 });
newsSchema.index({ views: -1 });
newsSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("News", newsSchema);
