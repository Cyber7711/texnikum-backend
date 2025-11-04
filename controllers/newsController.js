const newsService = require("../services/newService");

const createNews = async (req, res, next) => {
  try {
    const result = await newsService.createNew(req.body);
    res.status(201).json({
      success: true,
      message: "rasm muvaffaqiyatli yuklandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllNews = async (req, res, next) => {
  try {
    const result = await newsService.getAllNews();
    if (!result.length) {
      res.status(200).sent();
    }
    res.status(200).json({
      success: true,
      count: result.length,
      message: "yangiliklar muvaffaqiyatli topildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getNewsById = async (req, res, next) => {
  try {
    const result = await newsService.getNewsById(req.params, id);
    res.status(200).json({
      success: true,
      message: "yangilik muvaffaqiyatli topildi ",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const result = await newsService.updateNews(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Yangilik muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const result = await newsService.deleteNews(req.params.id);
    res.status(200).json({
      success: true,
      message: "Yangilik muvaffaqiyatli uchirildi",
    });
  } catch (err) {
    return next(err);
  }
};

const newsController = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
};
module.exports = newsController;
