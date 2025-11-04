const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: { type: String, required: true, trim: true, minlength: 10 },
    date: { type: Date, default: Date.now },
    expireDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > this.date;
        },
        message: "Expire date must be later than the announcement date",
      },
    },
    createdBy: {
      type: String,
      default: "Admin",
      immutable: true,
    },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

announcementSchema.pre("save", function (next) {
  if (this.expireDate && this.expireDate < new Date()) {
    this.isActive = false;
  }
  next();
});

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
