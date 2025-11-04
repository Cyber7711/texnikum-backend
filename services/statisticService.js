const { default: mongoose } = require("mongoose");
const Stats = require("../models/statistics");
const AppError = require("../utils/appError");

async function createStat(data) {
  const allowedFields = ["year", "students"];
  const filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const missing = ["year", "students"].filter((f) => !filtered(f));
  if (missing.length) {
    throw new AppError(`Maydon(lar) tuldirilmagan: ${missing.join(", ")}`, 400);
  }
  const stats = new Stats({ ...filtered });
  return await stats.save();
}

async function getAllStats() {
  return await Stats.find();
}

async function getStatById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const stat = await Stats.findById(id);
  if (!stat) {
    throw new AppError("Statistika topilmadi !", 400);
  }
  return stat;
}

async function updateStat(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const allowed = ["year", "students"];
  const filtered = {};

  for (const key of allowed) {
    if (allowed[key] !== undefined) filtered[key] = updateData[key];
  }
  const updated = await Stats.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw new AppError("Statistikani yangilab bulmadi", 404);
  }
  return updated;
}

async function deleteStat(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID formati notugri", 400);
  }
  const deleted = await Stats.findByIdAndUpdate(id, {
    isActive: false,
    new: true,
  });
  if (!deleted) {
    throw new AppError("Statistikani uchirib bulmadi", 404);
  }
  return deleted;
}

const statsService = {
  createStat,
  getAllStats,
  getStatById,
  updateStat,
  deleteStat,
};

module.exports = statsService;
