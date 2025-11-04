const { default: mongoose } = require("mongoose");
const Announcement = require("../models/announcement");
const AppError = require("../utils/appError");

async function createAnnouncement(data) {
  const allowedFields = ["title", "description", "expireDate"];
  const filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const missing = ["title", "description"].filter((f) => !filtered[f]);
  if (missing.length)
    throw new AppError(
      `Maydon(lar) to‘ldirilmagan: ${missing.join(", ")}`,
      400
    );

  const announcement = new Announcement({
    ...filtered,
    createdBy: data.createdBy || "Admin",
  });

  return await announcement.save();
}

async function getAllAnnouncements() {
  const now = new Date();
  return await Announcement.find({
    $or: [{ expireDate: { $exists: false } }, { expireDate: { $gt: now } }],
    isActive: true,
  }).sort({ createdAt: -1 });
}

async function getAnnouncementById(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Notog‘ri ID formati", 400);

  const announcement = await Announcement.findById(id);
  if (!announcement) throw new AppError("E’lon topilmadi", 404);

  return announcement;
}

async function updateAnnouncement(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Notog‘ri ID formati", 400);

  const allowed = ["title", "description", "expireDate"];
  const filtered = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) filtered[key] = updateData[key];
  }

  const updated = await Announcement.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw new AppError("E’lon yangilab bo‘lmadi", 404);
  return updated;
}

async function deleteAnnouncement(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Notog‘ri ID formati", 400);

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!announcement)
    throw new AppError("E’lon topilmadi yoki o‘chirib bo‘lmadi", 404);

  return announcement;
}

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
