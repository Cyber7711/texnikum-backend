const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Ism kiritilishi shart"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon raqami kiritilishi shart"],
      unique: true,
    },
    direction: {
      type: String,
      required: [true, "Yo'nalishni tanlash shart"],
    },
    status: {
      type: String,
      enum: ["yangi", "bog'lanildi", "qabul", "rad"],
      default: "yangi",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Applicant", applicantSchema);
