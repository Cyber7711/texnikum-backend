const validateId = require("../middleware/idValidator");

const Announcement = require("../models/announcement");

const AppError = require("../utils/appError");

const { getCache, setCache, delCache } = require("../utils/cache");

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

      400,
    );
  }

  const announcement = await Announcement.create({
    ...filtered,

    createdBy: adminId,
  });

  // Invalidate announcements list cache

  await delCache("announcements:all");

  return announcement;
};

const getAllAnnouncements = async () => {
  const cacheKey = "announcements:all";

  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const announcements = await Announcement.find({ isActive: true })

    .sort({ createdAt: -1 })

    .select("-createdBy -__v") // maxfiy fieldlarni olib tashlash

    .populate({
      path: "createdBy",

      select: "username", // faqat username chiqadi
    });

  const plain = announcements.map((a) =>
    typeof a.toObject === "function" ? a.toObject() : a,
  );

  await setCache(cacheKey, plain);

  return plain;
};

// === GET BY ID ===

const getAnnouncementById = async (id) => {
  validateId(id);

  const cacheKey = `announcements:${id}`;

  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const announcement = await Announcement.findById(id).populate({
    path: "createdBy",

    select: "username",
  });

  if (!announcement || !announcement.isActive) {
    throw new AppError("E’lon topilmadi", 404);
  }

  const plain =
    typeof announcement.toObject === "function"
      ? announcement.toObject()
      : announcement;

  await setCache(cacheKey, plain);

  return plain;
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

    { new: true, runValidators: true },
  ).populate({
    path: "createdBy",

    select: "username",
  });

  if (!updated || !updated.isActive) {
    throw new AppError("E’lon topilmadi yoki yangilab bo‘lmadi", 404);
  }

  // Invalidate caches related to announcements

  await delCache("announcements:all");

  await delCache(`announcements:${id}`);

  return updated;
};

// === DELETE (soft delete) ===

const deleteAnnouncement = async (id) => {
  validateId(id);

  const announcement = await Announcement.findByIdAndUpdate(
    id,

    { isActive: false },

    { new: true },
  );

  if (!announcement) {
    throw new AppError("E’lon topilmadi yoki allaqachon o‘chirilgan", 404);
  }

  // Invalidate caches related to announcements

  await delCache("announcements:all");

  await delCache(`announcements:${id}`);

  return { message: "E’lon muvaffaqiyatli o‘chirildi (soft-delete)" };
};

module.exports = {
  createAnnouncement,

  getAllAnnouncements,

  getAnnouncementById,

  updateAnnouncement,

  deleteAnnouncement,
};
