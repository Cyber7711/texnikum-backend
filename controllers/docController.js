// controllers/docController.js
const docService = require("../services/docService");
const AppError = require("../utils/appError");
const path = require("path");

const createDoc = async (req, res, next) => {
  try {
    // 1. Fayl yuklanganini tekshirish
    if (!req.file) {
      return next(new AppError("Fayl yuklanishi shart!", 400));
    }

    // 2. Fayl turini aniqlash (pdf, docx...)
    const fileExtension = path
      .extname(req.file.originalname)
      .substring(1)
      .toLowerCase();

    // 3. Service uchun ma'lumotlarni tayyorlash
    const docData = {
      title: req.body.title,
      category: req.body.category, // Frontenddan keladigan kategoriya
      file: `/uploads/docs/${req.file.filename}`, // Bazaga nisbiy yo'l yoziladi
      fileType: fileExtension,
      fileSize: req.file.size,
    };

    // 4. Admin ID ni olish (protect middleware dan keladi)
    const adminId = req.user._id;

    const result = await docService.createDoc(docData, adminId);

    res.status(201).json({
      success: true,
      message: "Hujjat muvaffaqiyatli yuklandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllDocs = async (req, res, next) => {
  try {
    const result = await docService.getAllDocs(req.query); // Query params (search, filter) uchun
    res.status(200).json({
      success: true,
      count: result.length,
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
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateDoc = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Agar yangi fayl yuklangan bo'lsa, uni ham yangilaymiz
    if (req.file) {
      updateData.file = `/uploads/docs/${req.file.filename}`;
      updateData.fileType = path
        .extname(req.file.originalname)
        .substring(1)
        .toLowerCase();
      updateData.fileSize = req.file.size;
    }

    const result = await docService.updateDoc(
      req.params.id,
      updateData,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Hujjat muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteDoc = async (req, res, next) => {
  try {
    await docService.deleteDoc(req.params.id);
    res.status(200).json({
      success: true,
      message: "Hujjat muvaffaqiyatli o'chirildi",
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createDoc,
  getAllDocs,
  getDocById,
  updateDoc,
  deleteDoc,
};
