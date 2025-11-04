const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    desc: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

const Dpt = mongoose.model("Departments", departmentSchema);

module.exports = Dpt;
