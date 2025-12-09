// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tadbir nomi kiritilishi shart"],
      trim: true,
      minlength: [3, "Nomi kamida 3 belgidan iborat bo‘lishi kerak"],
      maxlength: [150, "Nomi 150 belgidan oshmasligi kerak"],
      match: [
        /^[a-zA-Z0-9\s\.\,\-\(\)а-яА-ЯёЁ№]+$/,
        "Nomi taqiqlangan belgilarni o‘z ichiga olmaydi",
      ],
    },
    description: {
      type: String,
      required: [true, "Tavsif kiritilishi shart"],
      trim: true,
      minlength: [10, "Tavsif kamida 10 belgidan iborat bo‘lishi kerak"],
      maxlength: [2000, "Tavsif 2000 belgidan oshmasligi kerak"],
    },
    startDate: {
      type: Date,
      required: [true, "Boshlanish sanasi kiritilishi shart"],
      default: Date.now,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v >= this.startDate;
        },
        message: "Tugash sanasi boshlanish sanasidan oldin bo‘lmasligi kerak",
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
    location: {
      type: String,
      trim: true,
      default: "Sport majmuasi",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", 
      required: true,
      immutable: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true,
    collection: "events",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        delete ret.createdBy;
        // Agar endDate yo‘q bo‘lsa, startDate ni qaytarish
        ret.date = ret.startDate;
        if (ret.endDate) {
          ret.duration = `${ret.startDate.toLocaleDateString(
            "uz-UZ"
          )} — ${ret.endDate.toLocaleDateString("uz-UZ")}`;
        }
        return ret;
      },
    },
  }
);

// === INDEXLAR – JUDA MUHIM! ===
eventSchema.index({ startDate: -1 }); // Yangi tadbirlar birinchi chiqsin
eventSchema.index({ isActive: 1, isPublished: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ name: "text", description: "text" }); // Qidiruv uchun text index

// === COMPOUND UNIQUE – Bir kunda bir xil nomli tadbir bo‘lmasin ===
eventSchema.index({ name: 1, startDate: 1 }, { unique: true });

// === Avtomatik: o‘tgan tadbirlarni deaktiv qilish (ixtiyoriy) ===
eventSchema.pre("save", function (next) {
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  } else if (!this.endDate && this.startDate < new Date()) {
    this.isActive = false;
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
