const statsService = require("../services/statisticService");

const createStats = async (req, res, next) => {
  try {
    const result = await statsService.createStat(req.body);
    res.status(201).json({
      success: true,
      message: "statistika muvaffaqiyatli yaratildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllStats = async (req, res, next) => {
  try {
    const result = await statsService.getAllStats();
    if (!result.length) {
      res.status(200).send();
    }
    res.status(200).json({
      success: true,
      count: result.length,
      message: "statistikalar muvaffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getStatsById = async (req, res, next) => {
  try {
    const result = await statsService.getStatById(req.params.id);
    res.status(200).json({
      success: true,
      message: "statistika id si buyicha topildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateStats = async (req, res, next) => {
  try {
    const result = await statsService.updateStat(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "statistika muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteStats = async (req, res, next) => {
  try {
    const result = await statsService.deleteStat(req.params.id);
    res.status(200).json({
      success: true,
      message: "statistika muvaffaqiyatli uchirildi",
    });
  } catch (err) {
    return next(err);
  }
};

const statsController = {
  createStats,
  getAllStats,
  getStatsById,
  updateStats,
  deleteStats,
};

module.exports = statsController;
