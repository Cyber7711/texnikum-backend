const docService = require("../services/docService");

const createDoc = async (req, res, next) => {
  try {
    const result = await docService.createDoc(req.body);
    res.status(201).json({
      success: true,
      message: "Document muvaffaqiyatli yaratildi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllDocs = async (req, res, next) => {
  try {
    const result = await docService.getAllDocs();
    if (!result.length) {
      res.status(200).sent();
    }
    res.status(200).json({
      success: true,
      count: result.length,
      message: "Documentlar muvaffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getDocById = async (req, res, next) => {
  try {
    const result = await docService.getDocById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Document ID buyicha muvaffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateDoc = async (req, res, next) => {
  try {
    const result = await docService.updateDoc(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Document muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteDoc = async (req, res, next) => {
  try {
    const result = await docService.deleteDoc(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Document muvaffaqiyatli uchirildi" });
  } catch (err) {
    return next(err);
  }
};

const docController = {
  createDoc,
  getAllDocs,
  getDocById,
  updateDoc,
  deleteDoc,
};

module.exports = docController;
