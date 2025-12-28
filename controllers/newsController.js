const NewsService = require("../services/newsService");
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync");
const uploadToCloud = require("../utils/upload"); //
const deleteFromCloud = require("../utils/deleteFile"); //

// 1. Yangilik yaratish
exports.createNews = catchAsync(async (req, res, next) => {
  let imageUUID = null;

  // Rasm bo'lsa, uni Uploadcare'ga yuklaymiz
  if (req.file) {
    imageUUID = await uploadToCloud(req.file); //
  }

  if (!req.user || !req.user._id) {
    return next(new AppError("Avtorizatsiyadan o'tilmagan!", 401));
  }

  const newsData = {
    title: req.body.title,
    content: req.body.content,
    image: imageUUID, // Bazada faqat UUID saqlanadi
  };

  const result = await NewsService.createNews(newsData, req.user._id); //

  res.status(201).json({
    status: "success",
    message: "Yangilik muvaffaqiyatli yaratildi",
    data: result,
  });
});

// 2. Barcha yangiliklarni olish
exports.getAllNews = catchAsync(async (req, res, next) => {
  const result = await NewsService.getAllNews(); //

  res.status(200).json({
    status: "success",
    results: result.length,
    data: result,
  });
});

// 3. ID bo'yicha bitta yangilikni olish
exports.getNewsById = catchAsync(async (req, res, next) => {
  const result = await NewsService.getNewsById(req.params.id); //

  res.status(200).json({
    status: "success",
    data: result,
  });
});

// 4. Yangilikni tahrirlash (Rasm yangilansa, eskisini o'chirish bilan)
exports.updateNews = catchAsync(async (req, res, next) => {
  // Avval eski ma'lumotlarni tekshiramiz
  const oldNews = await NewsService.getNewsById(req.params.id);

  // Agar yangi rasm yuklangan bo'lsa
  if (req.file) {
    // Yangisini bulutga yuklaymiz
    const newImageUUID = await uploadToCloud(req.file);
    req.body.image = newImageUUID;

    // Agar eski rasm bo'lsa, uni bulutdan o'chiramiz
    if (oldNews.image) {
      await deleteFromCloud(oldNews.image);
    }
  }

  const result = await NewsService.updateNews(req.params.id, req.body); //

  res.status(200).json({
    status: "success",
    message: "Yangilik muvaffaqiyatli yangilandi",
    data: result,
  });
});

// 5. O'chirish (Rasmni ham bulutdan o'chirish bilan)
exports.deleteNews = catchAsync(async (req, res, next) => {
  // O'chirishdan oldin yangilikni topib, rasmini tekshiramiz
  const news = await NewsService.getNewsById(req.params.id);

  // Agar rasm mavjud bo'lsa, Uploadcare'dan o'chiramiz
  if (news.image) {
    await deleteFromCloud(news.image);
  }

  await NewsService.deleteNews(req.params.id); //

  res.status(204).json({
    status: "success",
    data: null,
  });
});
