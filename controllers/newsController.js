const NewsService = require("../services/newsService");
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync");
const uploadToCloud = require("../utils/upload");
const deleteFromCloud = require("../utils/deleteFile");

// 1. Yangilik yaratish
exports.createNews = catchAsync(async (req, res, next) => {
  let imageUUID = null;

  // Agar rasm yuklangan bo'lsa (MemoryStorage'dan Buffer orqali)
  if (req.file) {
    imageUUID = await uploadToCloud(req.file);
  }

  // Admin tekshiruvi (Protect middleware'dan keladi)
  if (!req.user || !req.user._id) {
    return next(
      new AppError("Avtorizatsiyadan o'tilmagan! Iltimos, qayta kiring.", 401),
    );
  }

  const newsData = {
    title: req.body.title,
    content: req.body.content,
    image: imageUUID, // Bazada faqat UUID string saqlanadi
    // Agar modelingizda author bo'lsa:
    author: req.user._id,
  };

  const result = await NewsService.createNews(newsData);

  res.status(201).json({
    status: "success",
    message: "Yangilik muvaffaqiyatli yaratildi",
    data: result,
  });
});

// 2. Barcha yangiliklarni olish
exports.getAllNews = catchAsync(async (req, res, next) => {
  const result = await NewsService.getAllNews();

  res.status(200).json({
    status: "success",
    results: result.length,
    data: result,
  });
});

// 3. ID bo'yicha bitta yangilikni olish
exports.getNewsById = catchAsync(async (req, res, next) => {
  const result = await NewsService.getNewsById(req.params.id);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

// TO'G'RILANGAN News Controller Update qismi:
exports.updateNews = catchAsync(async (req, res, next) => {
  const oldNews = await NewsService.getNewsById(req.params.id);
  let updateData = { ...req.body };

  if (req.file) {
    const newImageUUID = await uploadToCloud(req.file);
    updateData.image = newImageUUID;
  }

  // 1. Avval bazani yangilaymiz
  const result = await NewsService.updateNews(req.params.id, updateData);

  // 2. Agar yangilanish o'xshasa va yangi rasm bo'lsa, eskisini o'chiramiz
  if (req.file && oldNews.image) {
    deleteFromCloud(oldNews.image).catch((err) =>
      console.error("Cloud delete error:", err),
    );
  }

  res.status(200).json({ status: "success", data: result });
});

// 5. O'chirish
exports.deleteNews = catchAsync(async (req, res, next) => {
  const news = await NewsService.getNewsById(req.params.id);

  // Rasmni bulutdan o'chiramiz
  if (news.image) {
    await deleteFromCloud(news.image);
  }

  await NewsService.deleteNews(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
