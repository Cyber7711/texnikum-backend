const dptServices = require("../services/dptService");
const AppError = require("../utils/appError");

const createDpt = async (req, res, next) => {
  try {
    const result = await dptServices.createDpt(req.body);
    if (!result) throw new AppError("Dpt yaratib bo‘lmadi", 400);

    res.status(201).json({
      success: true,
      message: "Dpt muvaffaqiyatli yaratildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllDpts = async (req, res, next) => {
  try {
    const result = await dptServices.getAllDpts();
    if (!result.length) {
      return res.status(200).json({
        success: true,
        message: "Hozircha Dpt lar yo‘q",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Dpt lar muvaffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getDptById = async (req, res, next) => {
  try {
    const result = await dptServices.getDptsById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Dpt muvaffaqiyatli topildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateDpt = async (req, res, next) => {
  try {
    const result = await dptServices.updateDpts(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Dpt muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteDpt = async (req, res, next) => {
  try {
    const result = await dptServices.deleteDpts(req.params.id);
    res.status(200).json({
      success: true,
      message: "Dpt muvaffaqiyatli o‘chirildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createDpt,
  getAllDpts,
  getDptById,
  updateDpt,
  deleteDpt,
};
