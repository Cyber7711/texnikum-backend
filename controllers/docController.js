const DocService = require("../services/docService");
const Document = require("../models/documents");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const uploadToCloud = require("../utils/upload");
const deleteFromCloud = require("../utils/deleteFile");
const AppError = require("../utils/appError");

// 1. Hammasini olish
exports.getAll = catchAsync(async (req, res) => {
  const result = await DocService.getAllDocs(req.query);
  sendResponse(res, {
    status: 200,
    results: result.length,
    data: result,
  });
});

// 2. ID bo'yicha olish
exports.getById = catchAsync(async (req, res) => {
  const result = await DocService.getDocById(req.params.id);
  sendResponse(res, { status: 200, data: result });
});

// 3. Yaratish (Backend-side upload)
exports.create = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Fayl yuklanishi shart!", 400));
  }

  // Faylni bulutga yuklash
  const fileUUID = await uploadToCloud(req.file);

  const docData = {
    title: req.body.title,
    category: req.body.category,
    file: fileUUID,
    fileType: req.file.originalname.split(".").pop().toLowerCase(),
    fileSize: req.file.size,
    createdBy: req.user._id,
  };

  const result = await DocService.createDoc(docData);

  sendResponse(res, {
    status: 201,
    message: "Hujjat muvaffaqiyatli saqlandi",
    data: result,
  });
});

// 4. Yangilash (Fayl bilan yoki faylsiz)
exports.update = catchAsync(async (req, res, next) => {
  const oldDoc = await Document.findById(req.params.id);
  if (!oldDoc) return next(new AppError("Hujjat topilmadi", 404));

  const updateData = { ...req.body };

  // Agar yangi fayl yuklangan bo'lsa
  if (req.file) {
    // 1. Yangi faylni bulutga yuklash
    const newFileUUID = await uploadToCloud(req.file);
    updateData.file = newFileUUID;
    updateData.fileType = req.file.originalname.split(".").pop().toLowerCase();
    updateData.fileSize = req.file.size;

    // 2. Eski faylni bulutdan o'chirish
    if (oldDoc.file) {
      await deleteFromCloud(oldDoc.file);
    }
  }

  const result = await DocService.updateDoc(req.params.id, updateData);

  sendResponse(res, {
    status: 200,
    message: "Hujjat ma'lumotlari yangilandi",
    data: result,
  });
});

// 5. O'chirish
exports.deleteDoc = catchAsync(async (req, res, next) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return next(new AppError("Hujjat topilmadi", 404));

  // Bulutdan o'chirish
  if (doc.file) {
    await deleteFromCloud(doc.file);
  }

  // Bazadan o'chirish (yoki soft-delete)
  await DocService.deleteDoc(req.params.id);

  sendResponse(res, {
    status: 200,
    message: "Hujjat bazadan va bulutdan o'chirildi",
  });
});
