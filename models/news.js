const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    default: Date.now,
  },
  author: {
    type: String,
    default: "Admin",
  },
  image: {
    type: String,
    default: null,
  },
});

const News = mongoose.model("News", newsSchema);

module.exports = News;
