const mongoose = require("mongoose");
const Dpt = require("../models/departments");
const AppError = require("../utils/appError");

async function createDpt(data) {
  const { name, desc, duration } = data;
  if (!name || !desc || !duration) {
    throw new AppError("name, decs, duration yozilishi shart", 400);
  }
  return await new Dpt({ name, desc, duration }).save();
}

async function getAllDpts() {
  return await Dpt.find();
}

async function getDptsById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Noto‘g‘ri ID formati", 400);
  }
  const dpt = await Dpt.findById(id);
  if (!dpt) throw new AppError("Bunday bo‘lim topilmadi", 404);
  return dpt;
}

async function updateDpts(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Noto‘g‘ri ID formati", 400);
  }

  const allowedFields = ["name", "decs", "duration"];
  const filtered = {};
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) filtered[key] = updateData[key];
  }

  const dpt = await Dpt.findByIdAndUpdate(id, filtered, { new: true });
  if (!dpt) throw new AppError("Bo‘limni yangilab bo‘lmadi", 400);
  return dpt;
}

async function deleteDpts(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Noto‘g‘ri ID formati", 400);
  }
  const dpt = await Dpt.findByIdAndDelete(id);
  if (!dpt) throw new AppError("Bo‘limni o‘chirishda xatolik", 400);
  return dpt;
}

module.exports = { createDpt, getAllDpts, getDptsById, updateDpts, deleteDpts };
