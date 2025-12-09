const { default: mongoose } = require("mongoose");
const News = require("../models/news");
const AppError = require("../utils/appError");

async function createNew(data, adminId) {
  const allowedFields = ["title", "content"];
  const filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const missing = ["title", "content"].filter((f) => !filtered[f]);
  if (missing.length)
    throw new AppError(`Maydon(lar) tuldirilmagan: ${missing.join(", ")}`, 400);

  const news = new News({ ...filtered });
  return await news.save();
}

async function getAllNews() {
  return await News.find();
}

async function getNewsById(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const news = await News.findById(id);
  if (!news) {
    throw new AppError("Yangilikni topib bulmadi", 400);
  }
  return news;
}

async function updateNews(id, updateData) {
  if (mongoose.Types.ObjectId.isValid) {
    throw new AppError("ID formati notugri", 400);
  }
  const allowed = ["title", "content"];
  const filtered = {};
  for (const key of allowed) {
    if (allowed[key] !== undefined) {
      filtered[key] = updateData[key];
    }
  }
  const updated = await News.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw new AppError("Yangilikni yangilab bulmadi", 404);
  }

  return updated;
}

async function deleteNews(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const news = await News.findByIdAndUpdate(id, { isActive: false, new: true });
  if (!news) {
    throw new AppError("Yangilikni uchirib bulmadi", 404);
  }
  return news;
}

const newsService = {
  createNew,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
};

module.exports = newsService;
