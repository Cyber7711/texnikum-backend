const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      min: 2000,
      unique: true,
    },
    students: { type: Number, required: true, min: 0 },
    graduates: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function (v) {
          const students =
            this instanceof mongoose.Query
              ? this.getUpdate().students || this.getUpdate().$set?.students
              : this.students;
          if (students !== undefined) return v <= students;
          return true;
        },
        message: "Bitiruvchilar soni jami o‘quvchilardan oshmasligi kerak",
      },
    },
    teachers: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, select: false },
    note: { type: String, trim: true, maxlength: 500, default: "" },
  },
  {
    timestamps: true,
    collection: "statistics",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.isActive;
        return ret;
      },
    },
  },
);

statisticSchema.index({ year: 1 }, { unique: true });

statisticSchema.pre("save", function (next) {
  this.year = Number(this.year);
  next();
});

module.exports = mongoose.model("Statistic", statisticSchema);
