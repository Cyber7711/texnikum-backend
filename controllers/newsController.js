const NewsService = require("../services/newsService"); // Fayl nomiga e'tibor bering!
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync"); // Yoki middleware/asyncWrapper

// 1. Yangilik yaratish
exports.createNews = catchAsync(async (req, res, next) => {
  // Rasm bor-yo'qligini tekshiramiz
  let imagePath = null;
  if (req.file) {
    imagePath = `/uploads/news/${req.file.filename}`;
  }

  // Token orqali kelgan Admin ID sini tekshiramiz
  if (!req.user || !req.user._id) {
    return next(new AppError("Avtorizatsiyadan o'tilmagan!", 401));
  }

  // Servicega tayyor ma'lumotni beramiz
  const newsData = {
    title: req.body.title,
    content: req.body.content,
    image: imagePath,
  };

  const result = await NewsService.createNews(newsData, req.user._id);

  res.status(201).json({
    status: "success",
    message: "Yangilik muvaffaqiyatli yaratildi",
    data: result,
  });
});

// 2. Barchasini olish
exports.getAllNews = catchAsync(async (req, res, next) => {
  const result = await NewsService.getAllNews();

  res.status(200).json({
    status: "success",
    count: result.length,
    data: result,
  });
});

// 3. Bittasini olish
exports.getNewsById = catchAsync(async (req, res, next) => {
  const result = await NewsService.getNewsById(req.params.id);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

// 4. Yangilash
exports.updateNews = catchAsync(async (req, res, next) => {
  // Agar rasm yangilansa, yangi pathni qo'shamiz
  if (req.file) {
    req.body.image = `/uploads/news/${req.file.filename}`;
  }

  const result = await NewsService.updateNews(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    message: "Yangilik yangilandi",
    data: result,
  });
});

// 5. O'chirish
exports.deleteNews = catchAsync(async (req, res, next) => {
  await NewsService.deleteNews(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
