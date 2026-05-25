const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v >= this.startDate;
        },
        message: "Tugash sanasi xato",
      },
    },
    eventType: {
      type: String,
      enum: [
        "seminar",
        "trening",
        "musobaqa",
        "ochiq dars",
        "bayram",
        "master-klass",
        "konferensiya",
        "boshqa",
      ],
      default: "boshqa",
    },
    location: { type: String, trim: true, default: "Sport majmuasi" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      select: false,
    },
    isActive: { type: Boolean, default: true, select: false },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "events",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;

        ret.date = ret.startDate;
        if (ret.startDate && ret.endDate) {
          ret.duration = `${new Date(ret.startDate).toLocaleDateString("uz-UZ")} — ${new Date(ret.endDate).toLocaleDateString("uz-UZ")}`;
        }
        return ret;
      },
    },
  },
);

eventSchema.index({ startDate: -1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Event", eventSchema);
