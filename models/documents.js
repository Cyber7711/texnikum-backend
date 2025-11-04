const mongoose = require("mongoose");

const newSchema = new mongoose.Schema({
  title: { type: String, required: [true, "sarlavhasi bulishi kerak"] },
  file: { type: String, required: [true, "file bulishi shart"] },
});

const Docs = mongoose.model("Documents", newSchema);

module.exports = Docs;
