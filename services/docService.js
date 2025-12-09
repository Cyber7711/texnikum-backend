const validateId = require("../middleware/idValidator");
const Document = require("../models/documents"); // ← model nomi "Document"
const AppError = require("../utils/appError");



// === CREATE DOCUMENT ===
const createDoc = async (docData, adminId) => {
  const { title, file, fileType, fileSize } = docData;

  if (!title || !file) {
    throw new AppError("Sarlavha va fayl maydonlari to‘ldirilishi shart", 400);
  }

  const doc = await Document.create({
    title,
    file,
    fileType,
    fileSize,
    createdBy: adminId, // ← JWT dan kelgan admin ID
  });

  return doc;
};

// === GET ALL (faqat faol hujjatlarni) ===
const getAllDocs = async () => {
  return await Document.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select("title file fileType fileSize createdAt")
    .populate({
      path: "createdBy",
      select: "username",
    });
};

// === GET BY ID ===
const getDocById = async (id) => {
  validateId(id);

  const doc = await Document.findOne({
    _id: id,
    isActive: true,
  }).populate({
    path: "createdBy",
    select: "username",
  });

  if (!doc) {
    throw new AppError("Hujjat topilmadi yoki o‘chirilgan", 404);
  }

  return doc;
};

// === UPDATE DOCUMENT ===
const updateDoc = async (id, updateData, adminId) => {
  validateId(id);

  const allowed = ["title", "file", "fileType", "fileSize"];
  const filtered = {};

  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      filtered[key] = updateData[key];
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new AppError("Hech qanday yangilanish ma’lumoti yuborilmadi", 400);
  }

  const updated = await Document.findOneAndUpdate(
    { _id: id, isActive: true },
    { ...filtered, updatedBy: adminId },
    { new: true, runValidators: true }
  ).populate({
    path: "createdBy",
    select: "username",
  });

  if (!updated) {
    throw new AppError("Hujjat topilmadi yoki yangilab bo‘lmadi", 404);
  }

  return updated;
};

// === DELETE (soft delete) ===
const deleteDoc = async (id) => {
  validateId(id);

  const doc = await Document.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!doc) {
    throw new AppError("Hujjat topilmadi yoki allaqachon o‘chirilgan", 404);
  }

  return { success: true, message: "Hujjat muvaffaqiyatli o‘chirildi" };
};

module.exports = {
  createDoc,
  getAllDocs,
  getDocById,
  updateDoc,
  deleteDoc,
};
