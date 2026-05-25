const Stats = require("../models/statistics"); // 1. MODELNI IMPORT QILISH SHART
const StatsService = require("../services/statisticService");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const News = require("../models/news"); // Sanash uchun kerak bo'lsa

// BU GETALL VAZIFASINI BAJARADI
const getAll = catchAsync(async (req, res) => {
  // Bazadan bittasini olamiz
  const stats = await Stats.findOne().sort({ createdAt: -1 });
  // Agarda avtomatik sanash kerak bo'lsa (masalan news):
  const newsCount = await News.countDocuments();

  sendResponse(res, {
    status: 200,
    message: "Statistikalar muvaffaqiyatli olindi",
    data: {
      ...stats?.toObject(),
      news: newsCount,
    },
  });
});

const updateStats = catchAsync(async (req, res, next) => {
  // Bazada statistika bormi?
  let stats = await Stats.findOne();

  if (stats) {
    // Agar bo'lsa - yangilaymiz
    stats = await Stats.findByIdAndUpdate(stats._id, req.body, {
      new: true,
      runValidators: true,
    });
  } else {
    // Agar yo'q bo'lsa - yangi yaratamiz
    // req.user._id 'protect' middleware dan keladi
    stats = await Stats.create({ ...req.body, author: req.user._id });
  }

  sendResponse(res, {
    status: 200,
    message: "Statistika muvaffaqiyatli saqlandi",
    data: stats,
  });
});

// Qolgan funksiyalar (agar kerak bo'lsa)
const getById = catchAsync(async (req, res) => {
  const result = await StatsService.getById(req.params.id);
  sendResponse(res, { status: 200, data: result });
});

module.exports = {
  updateStats,
  getAll, // Routerda ishlatilgani uchun bu yerda bo'lishi shart
  getById,
};
