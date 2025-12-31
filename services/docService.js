const Document = require("../models/documents");
const AppError = require("../utils/appError");

const createDoc = async (data) => {
  return await Document.create(data);
};

const getAllDocs = async (query) => {
  let filter = { isActive: true };

  // Kategoriyaga ko'ra filtrlash
  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  // Qidiruv (Search)
  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  return await Document.find(filter)
    .sort("-createdAt")
    .populate("createdBy", "name username");
};

const getDocById = async (id) => {
  const doc = await Document.findOne({ _id: id, isActive: true });
  if (!doc) throw new AppError("Hujjat topilmadi", 404);
  return doc;
};

const updateDoc = async (id, updateData) => {
  const doc = await Document.findOneAndUpdate(
    { _id: id, isActive: true },
    updateData,
    { new: true, runValidators: true }
  );
  if (!doc) throw new AppError("Hujjat topilmadi", 404);
  return doc;
};

const deleteDoc = async (id) => {
  // Soft delete (tavsiya etiladi) yoki Hard delete
  const doc = await Document.findOneAndDelete({ _id: id });
  // Agar soft delete kerak bo'lsa: findOneAndUpdate({_id: id}, {isActive: false})

  if (!doc) throw new AppError("Hujjat topilmadi", 404);
  return doc;
};

module.exports = {
  createDoc,
  getAllDocs,
  getDocById,
  updateDoc,
  deleteDoc,
};
