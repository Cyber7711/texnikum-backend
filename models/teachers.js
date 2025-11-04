const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "uqituvchi ismi kiritilishi shart"],
      minlength: [3, "ism kamida 3 ta harfdan iborat bulishi kerak"],
      maxlength: [30, "ism 30 ta harfdan oshmasligi kerak"],
      match: [
        /^[A-Za-zА-Яа-я\s'‘’-]+$/,
        "ismda raqam yoki maxsus raqamlar bulmasligi kerak",
      ],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Fan nomi kiritilishi shart"],
      enum: {
        values: ["Matematika", "Fizika", "Informatika", "Tarix", "Ingliz tili"],
        message: "Fan nomi notugri",
      },
    },
    experience: {
      type: Number,
      required: [true, "Tajriba yili kiritilishi shart"],
      min: [0, "Tajriba manfiy bulmasligi kerak"],
      max: [50, "Tajriba 50 yildan oshmasligi kerak"],
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi shart"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Email formati noto‘g‘ri!"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

newSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Teacher = mongoose.model("Teache", newSchema);

module.exports = Teacher;
