const DocService = require("../services/docService");
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

// 3. Yaratish
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
    // Fayl turi va hajmini avtomatik aniqlash
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

// 4. Yangilash (XAVFSIZ USUL) ✅
exports.update = catchAsync(async (req, res, next) => {
  // 1. Avval eski hujjatni topamiz
  const oldDoc = await DocService.getDocById(req.params.id);

  const updateData = { ...req.body };
  let newFileUUID = null;

  // 2. Agar yangi fayl yuklangan bo'lsa
  if (req.file) {
    newFileUUID = await uploadToCloud(req.file);
    updateData.file = newFileUUID;
    updateData.fileType = req.file.originalname.split(".").pop().toLowerCase();
    updateData.fileSize = req.file.size;
  }

  // 3. Bazani yangilashga harakat qilamiz
  try {
    const result = await DocService.updateDoc(req.params.id, updateData);

    // 4. Muvaffaqiyatli bo'lsa, ESKI faylni o'chiramiz
    if (req.file && oldDoc.file) {
      deleteFromCloud(oldDoc.file).catch((err) =>
        console.error("Eski hujjatni o'chirishda xatolik:", err),
      );
    }

    sendResponse(res, {
      status: 200,
      message: "Hujjat yangilandi",
      data: result,
    });
  } catch (error) {
    // ⚠️ Agar bazada xatolik bo'lsa va biz yangi fayl yuklagan bo'lsak,
    // o'sha YANGI faylni o'chirib tashlash kerak (chunki u endi kerak emas)
    if (newFileUUID) {
      await deleteFromCloud(newFileUUID);
    }
    throw error; // Xatoni clientga qaytaramiz
  }
});

// 5. O'chirish (XAVFSIZ USUL) ✅
exports.deleteDoc = catchAsync(async (req, res, next) => {
  const doc = await DocService.getDocById(req.params.id);

  // 1. Avval bazadan o'chiramiz
  await DocService.deleteDoc(req.params.id);

  // 2. Muvaffaqiyatli bo'lsa, keyin bulutdan o'chiramiz
  if (doc.file) {
    deleteFromCloud(doc.file).catch((err) =>
      console.error("Bulutdan o'chirishda xatolik:", err),
    );
  }

  sendResponse(res, {
    status: 200,
    message: "Hujjat o'chirildi",
  });
});
