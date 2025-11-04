const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  students: { type: Number, required: true },
  graduates: { type: Number, default: 0 },
  teachers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Stats = mongoose.model("Statistics", statsSchema);

module.exports = Stats;
