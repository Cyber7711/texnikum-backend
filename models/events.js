const mongoose = require("mongoose");

const newSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, default: "" },
});

const Event = mongoose.model("Event", newSchema);

module.exports = Event;
