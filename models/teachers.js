const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "O‘qituvchi ismi kiritilishi shart"],
      trim: true,
      minlength: [3, "Ism kamida 3 ta harfdan iborat bo‘lishi kerak"],
      maxlength: [50, "Ism 50 ta harfdan oshmasligi kerak"],
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
    },
    phone: {
      type: String,
      required: [true, "Telefon raqami kiritilishi shart"],
      unique: true,
      trim: true,
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
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;

        // Supabase URL yasash (Rasmlar uchun)
        if (ret.photo) {
          const supabaseUrl = process.env.SUPABASE_URL;
          ret.photoUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${ret.photo}`;
        } else {
          ret.photoUrl = null;
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

teacherSchema.index({ subject: 1 });
teacherSchema.index({ fullname: "text" });

module.exports = mongoose.model("Teacher", teacherSchema);
