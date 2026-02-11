const mongoose = require("mongoose");

const leaderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // "dir_1", "dep_1", "h1" ...
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["director", "deputy", "head"],
      required: true,
    },

    phone: { type: String, default: null },
    email: { type: String, default: null },
    reception: { type: String, default: null },
    bio: { type: String, default: null },
    education: { type: String, default: null },
    experience: { type: String, default: null },

    // HEADS uchun icon key (Users, Building2, BadgeCheck, FileText)
    iconKey: { type: String, default: null },

    // Uploadcare UUID
    image: { type: String, default: null },
    imagePublicId: { type: String, select: false }, // hozircha shartmas, news’da bor — standart
  },
  { _id: false },
);

const managementSchema = new mongoose.Schema(
  {
    director: { type: leaderSchema, required: true },
    deputies: { type: [leaderSchema], default: [] },
    heads: { type: [leaderSchema], default: [] },

    isActive: { type: Boolean, default: true, select: false },
  },
  {
    timestamps: true,
    collection: "management",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        delete ret.imagePublicId;

        const withImageUrls = (leader) => {
          if (!leader) return leader;

          // leader.image => UUID bo‘lsa, URLlarni qo‘shamiz
          if (leader.image && leader.image.length > 5) {
            const uuid = leader.image;
            leader.imageUrl = `https://ucarecdn.com/${uuid}/`;
            leader.imagePreview = `https://ucarecdn.com/${uuid}/-/preview/400x400/-/quality/smart/`;
          } else {
            leader.imageUrl = null;
            leader.imagePreview = null;
          }
          return leader;
        };

        ret.director = withImageUrls(ret.director);
        ret.deputies = (ret.deputies || []).map(withImageUrls);
        ret.heads = (ret.heads || []).map(withImageUrls);

        return ret;
      },
    },
  },
);

const Management = mongoose.model("Management", managementSchema);
module.exports = Management;
