const DocService = require("../services/docService");
const Document = require("../models/documents");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const deleteFromCloud = require("../utils/deleteFile");
const AppError = require("../utils/appError");

// 1. Hammasini olish (O'zgarishsiz)
const getAll = catchAsync(async (req, res) => {
  const result = await DocService.getAllDocs(req.query);
  sendResponse(res, {
    status: 200,
    results: result.length,
    data: result,
  });
});

// 2. ID bo'yicha olish (O'zgarishsiz)
const getById = catchAsync(async (req, res) => {
  const result = await DocService.getDocById(req.params.id);
  sendResponse(res, { status: 200, data: result });
});

// 3. Yaratish (MUHIM O'ZGARISHLAR)
const create = catchAsync(async (req, res, next) => {
  const { title, category, file, fileType, fileSize } = req.body;

  // Xavfsizlik chorasi: file maydonini tekshirish
  if (!file || typeof file === "object") {
    return next(
      new AppError("Fayl noto'g'ri formatda yuborildi. UUID kutilmoqda.", 400)
    );
  }

  const docData = {
    title,
    category,
    file: String(file), // Majburiy stringga o'tkazish
    fileType,
    fileSize,
    createdBy: req.user._id,
  };

  const result = await DocService.createDoc(docData);

  sendResponse(res, {
    status: 201,
    message: "Hujjat muvaffaqiyatli saqlandi",
    data: result,
  });
});

// 4. Yangilash (MUHIM O'ZGARISHLAR)
const update = catchAsync(async (req, res, next) => {
  const { file } = req.body;
  const oldDoc = await Document.findById(req.params.id);

  if (!oldDoc) return next(new AppError("Hujjat topilmadi", 404));

  // Agar yangi fayl kelgan bo'lsa va u ob'ekt bo'lsa, xato beramiz
  if (file && typeof file === "object") {
    return next(new AppError("Fayl UUID formatida bo'lishi shart", 400));
  }

  if (file && oldDoc.file !== file) {
    if (oldDoc.file) {
      await deleteFromCloud(oldDoc.file);
    }
  }

  // Faqat kerakli maydonlarni yangilash
  const updateData = { ...req.body };
  if (file) updateData.file = String(file); // Majburiy string

  const result = await DocService.updateDoc(req.params.id, updateData);

  sendResponse(res, {
    status: 200,
    message: "Hujjat ma'lumotlari yangilandi",
    data: result,
  });
});

// 5. O'chirish (O'zgarishsiz)
const deleteDoc = catchAsync(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (doc?.file) {
    await deleteFromCloud(doc.file);
  }
  await DocService.deleteDoc(req.params.id);
  sendResponse(res, {
    status: 200,
    message: "Hujjat bazadan va bulutdan o'chirildi",
  });
});

module.exports = { getAll, getById, create, update, deleteDoc };
