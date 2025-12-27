// services/docService.js
const Document = require("../models/documents");
const AppError = require("../utils/appError");

// === CREATE ===
const createDoc = async (docData, adminId) => {
  const { title, category, file, fileType, fileSize } = docData;

  const doc = await Document.create({
    title,
    category,
    file,
    fileType,
    fileSize,
    createdBy: adminId,
  });

  return doc;
};

// === GET ALL ===
const getAllDocs = async (query) => {
  // Oddiy filtratsiya (search)
  let filter = { isActive: true };

  if (query && query.category) {
    filter.category = query.category;
  }

  // Agar qidiruv so'zi bo'lsa
  if (query && query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  return await Document.find(filter).sort({ createdAt: -1 }).populate({
    path: "createdBy",
    select: "name username", // Admin ismini ham qaytarish
  });
};

// === GET BY ID ===
const getDocById = async (id) => {
  const doc = await Document.findOne({ _id: id, isActive: true }).populate(
    "createdBy",
    "username"
  );
  if (!doc) throw new AppError("Hujjat topilmadi", 404);
  return doc;
};

// === UPDATE ===
const updateDoc = async (id, updateData, adminId) => {
  // Ruxsat etilgan maydonlar
  const allowedFields = ["title", "category", "file", "fileType", "fileSize"];
  const filteredData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  // Oxirgi o'zgartirgan odamni ham saqlash mumkin (agar modelda bo'lsa)
  // filteredData.updatedBy = adminId;

  const updatedDoc = await Document.findOneAndUpdate(
    { _id: id, isActive: true },
    filteredData,
    { new: true, runValidators: true }
  );

  if (!updatedDoc) throw new AppError("Hujjat topilmadi", 404);
  return updatedDoc;
};

// === DELETE (Soft delete) ===
const deleteDoc = async (id) => {
  const deleted = await Document.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!deleted) throw new AppError("Hujjat topilmadi", 404);
  return deleted;
};

module.exports = {
  createDoc,
  getAllDocs,
  getDocById,
  updateDoc,
  deleteDoc,
};
