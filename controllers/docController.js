const DocService = require("../services/docService");
const Document = require("../models/documents"); // Modelni import qildik (eski faylni topish uchun)
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const deleteFromCloud = require("../utils/deleteFile"); // Faylni bulutdan o'chirish uchun

// 1. Hammasini olish
const getAll = catchAsync(async (req, res) => {
  const result = await DocService.getAllDocs(req.query);

  sendResponse(res, {
    status: 200,
    results: result.length,
    data: result,
  });
});

// 2. ID bo'yicha olish
const getById = catchAsync(async (req, res) => {
  const result = await DocService.getDocById(req.params.id);

  sendResponse(res, {
    status: 200,
    data: result,
  });
});

// 3. Yaratish
const create = catchAsync(async (req, res) => {
  // Eslatma: Biz frontendda Widget ishlatganimiz uchun,
  // req.body.file ichida allaqachon UUID (string) keladi.
  // Shuning uchun bu yerda uploadToCloud() shart emas.

  const docData = {
    ...req.body,
    createdBy: req.user._id, // Admin ID
  };

  const result = await DocService.createDoc(docData);

  sendResponse(res, {
    status: 201,
    message: "Hujjat muvaffaqiyatli saqlandi",
    data: result,
  });
});

// 4. Yangilash
const update = catchAsync(async (req, res) => {
  // Agar yangi fayl (UUID) kelgan bo'lsa, eskisini o'chiramiz
  if (req.body.file) {
    const oldDoc = await Document.findById(req.params.id);

    // Agar eski hujjatda fayl bo'lsa va u yangisidan farq qilsa
    if (oldDoc?.file && oldDoc.file !== req.body.file) {
      await deleteFromCloud(oldDoc.file); // Uploadcare'dan o'chiramiz
    }
  }

  const result = await DocService.updateDoc(req.params.id, req.body);

  sendResponse(res, {
    status: 200,
    message: "Hujjat ma'lumotlari yangilandi",
    data: result,
  });
});

// 5. O'chirish
const deleteDoc = catchAsync(async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (doc?.file) {
    // Bulutdan (Uploadcare) o'chiramiz
    await deleteFromCloud(doc.file);
  }

  await DocService.deleteDoc(req.params.id);

  sendResponse(res, {
    status: 200,
    message: "Hujjat bazadan va bulutdan o'chirildi",
  });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteDoc,
};
