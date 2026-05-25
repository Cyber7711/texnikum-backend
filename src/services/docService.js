const Document = require("../models/documents");
const AppError = require("../utils/appError");

// Regex belgilarni zararsizlantirish uchun yordamchi funksiya
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const createDoc = async (data) => {
  return await Document.create(data);
};

const getAllDocs = async (query) => {
  let filter = { isActive: true };

  // Kategoriyaga ko'ra
  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  // Qidiruv (Xavfsiz Regex) ✅
  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.title = { $regex: safeSearch, $options: "i" };
  }

  return await Document.find(filter)
    .sort("-createdAt")
    .populate("createdBy", "name username"); // Admin modeliga qarab fieldlarni o'zgartiring
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
    { new: true, runValidators: true },
  );
  if (!doc) throw new AppError("Hujjat topilmadi", 404);
  return doc;
};

const deleteDoc = async (id) => {
  const doc = await Document.findOneAndDelete({ _id: id });
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
