const { default: mongoose } = require("mongoose");
const Docs = require("../models/documents");
const AppError = require("../utils/appError");

async function createDoc(data) {
  const allowedFields = ["title", "file"];
  const filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const missing = ["title", "file"].filter((f) => !filtered[f]);
  if (missing.length)
    throw new AppError(`Maydon(lar) tuldirilmagan: ${missing.join(", ")}`, 400);

  const doc = new Docs({ ...filtered });
  return await doc.save();
}

async function getAllDocs() {
  return await Docs.find();
}

async function getDocById(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("ID formati notugri", 400);
  const doc = await Docs.findById(id);
  if (!doc) {
    throw new AppError("Document topilmadi", 400);
  }
  return doc;
}

async function updateDoc(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const allowed = ["title", "file"];
  const filtered = {};
  for (const key of allowed) {
    if (allowed !== undefined) {
      filtered[key] = updateData[key];
    }
  }
  const updated = await Docs.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw new AppError("Document ni yangilab bulmadi", 404);
  }
  return updated;
}

async function deleteDoc(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const doc = await Docs.findByIdAndUpdate(id, { isActive: false, new: true });
  if (!doc) {
    throw new AppError("Documentni yangilab bulmadi", 404);
  }
  return doc;
}

const docService = { createDoc, getAllDocs, getDocById, updateDoc, deleteDoc };
module.exports = docService;
