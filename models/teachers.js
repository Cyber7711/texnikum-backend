// models/Teacher.js
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "O‘qituvchi ismi kiritilishi shart"],
      trim: true,
      minlength: [3, "Ism kamida 3 ta harfdan iborat bo‘lishi kerak"],
      maxlength: [50, "Ism 50 ta harfdan oshmasligi kerak"],
      match: [
        /^[A-Za-zА-Яа-яЁё\s'‘’–-]+$/,
        "Ismda faqat harflar, bo‘sh joy va apostrof bo‘lishi mumkin",
      ],
    },
    subject: {
      type: String,
      required: [true, "Fan nomi kiritilishi shart"],
      enum: {
        values: [
          "Matematika",
          "Fizika",
          "Informatika",
          "Tarix",
          "Ingliz tili",
          "Ona tili va adabiyot",
          "Kimyo",
          "Biologiya",
          "Jismoniy tarbiya",
          "Boshqa",
        ],
        message: "{VALUE} fan nomi ro‘yxatda yo‘q",
      },
    },
    experience: {
      type: Number,
      required: [true, "Tajriba yili kiritilishi shart"],
      min: [0, "Tajriba manfiy bo‘lmasligi kerak"],
      max: [50, "Tajriba 50 yildan oshmasligi kerak"],
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Iltimos, to‘g‘ri email kiriting"],
    },
    phone: {
      type: String,
      required: [true, "Telefon raqami kiritilishi shart"],
      unique: true,
      trim: true,
      match: [
        /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/,
        "Telefon raqami +998 formatida bo‘lishi kerak",
      ],
    },
    photo: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "teachers",
    // models/Teacher.js ichida
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        delete ret.createdBy;

        // UUID dan to'liq CDN URL yasashda xato va domen muammolarini tuzatish
        if (ret.photo && ret.photo.length > 5) {
          const uuid = ret.photo.trim(); // Bo'shliqlardan tozalash
          const domain = "5nezpc68d1.ucarecd.net"; // Sizning ishlayotgan domeningiz

          // Asil URL (Oxirida slesh bo'lishi shart!)
          ret.photoUrl = `https://${domain}/${uuid}/`;

          // Optimizatsiya qilingan avatar (Oxirida slesh va format qo'shildi)
          ret.photoAvatar = `https://${domain}/${uuid}/-/scale_crop/200x200/smart/-/format/auto/`;
        } else {
          ret.photoUrl = null;
          ret.photoAvatar = null;
        }

        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// === INDEXLAR – Tez qidiruv uchun ===
teacherSchema.index({ email: 1 });
teacherSchema.index({ phone: 1 });
teacherSchema.index({ subject: 1 });
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ createdAt: -1 });
teacherSchema.index({ fullname: "text" }); // Ism bo‘yicha qidiruv

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
