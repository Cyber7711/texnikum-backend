const validateId = require("../middleware/idValidator");
const Announcement = require("../models/announcement");
const AppError = require("../utils/appError");

// === CREATE ===
const createAnnouncement = async (data, adminId) => {
  const allowedFields = ["title", "description", "expireDate"];
  const filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  if (!filtered.title || !filtered.description) {
    throw new AppError(
      "Sarlavha va tavsif maydonlari to‘ldirilishi shart",
      400
    );
  }

  const announcement = await Announcement.create({
    ...filtered,
    createdBy: adminId,
  });

  return announcement;
};

const getAllAnnouncements = async () => {
  return await Announcement.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select("-createdBy -__v") // maxfiy fieldlarni olib tashlash
    .populate({
      path: "createdBy",
      select: "username", // faqat username chiqadi
    });
};

// === GET BY ID ===
const getAnnouncementById = async (id) => {
  validateId(id);

  const announcement = await Announcement.findById(id).populate({
    path: "createdBy",
    select: "username",
  });

  if (!announcement || !announcement.isActive) {
    throw new AppError("E’lon topilmadi", 404);
  }

  return announcement;
};

// === UPDATE ===
const updateAnnouncement = async (id, updateData, adminId) => {
  validateId(id);

  const allowed = ["title", "description", "expireDate"];
  const filtered = {};

  for (const key of allowed) {
    if (updateData[key] !== undefined) filtered[key] = updateData[key];
  }

  if (Object.keys(filtered).length === 0) {
    throw new AppError("Hech qanday yangilanish ma’lumoti yuborilmadi", 400);
  }

  const updated = await Announcement.findByIdAndUpdate(
    id,
    { ...filtered, updatedBy: adminId }, // kim o‘zgartirganini ham saqlash
    { new: true, runValidators: true }
  ).populate({
    path: "createdBy",
    select: "username",
  });

  if (!updated || !updated.isActive) {
    throw new AppError("E’lon topilmadi yoki yangilab bo‘lmadi", 404);
  }

  return updated;
};

// === DELETE (soft delete) ===
const deleteAnnouncement = async (id) => {
  validateId(id);

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!announcement) {
    throw new AppError("E’lon topilmadi yoki allaqachon o‘chirilgan", 404);
  }

  return { message: "E’lon muvaffaqiyatli o‘chirildi (soft-delete)" };
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
