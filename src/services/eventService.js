const Event = require("../models/event.module");
const AppError = require("../utils/appError");
const { getCache, setCache, delCache } = require("../utils/cache");
/**
 * @desc Tadbir yaratish
 * Senior maslahati: Zod allaqachon ma'lumotni tozalab bergani uchun,
 * bizga faqat ruxsat berilgan "filtered" ma'lumot keladi.
 */
async function createEvents(data, adminId) {
  // createdBy ni biz o'zimiz (tizim) qo'shamiz, foydalanuvchi yubormaydi
  const event = await Event.create({
    ...data,
    createdBy: adminId,
  });

  // Invalidate list cache after creating a new event
  await delCache("events:all");
  return event;
}

/**
 * @desc Barcha faol tadbirlarni olish
 */
async function getAllEvents() {
  const now = new Date();

  const cacheKey = "events:all";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Senior Performance: Faqat kerakli maydonlarni select qilish bazaga yukni kamaytiradi
  const events = await Event.find({
    isActive: true,
    isPublished: true,
    startDate: { $gte: now },
  })
    .sort({ startDate: 1 })
    .limit(20)
    .select("name description startDate endDate location eventType")
    .populate("createdBy", "username");

  const plain = events.map((e) =>
    typeof e.toObject === "function" ? e.toObject() : e,
  );
  await setCache(cacheKey, plain);
  return plain;
}

async function getEventsById(id) {
  // validateId ni middleware darajasida (idValidator) hal qilish Senior uslubi
  const cacheKey = `events:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const event = await Event.findOne({ _id: id, isActive: true }).populate(
    "createdBy",
    "username",
  );

  if (!event) throw new AppError("Tadbir topilmadi", 404);
  const plain = typeof event.toObject === "function" ? event.toObject() : event;
  await setCache(cacheKey, plain);
  return plain;
}

/**
 * @desc Tadbirni yangilash
 */
async function updateEvents(id, updateData) {
  // runValidators: true modeldagi enum va boshqa cheklovlarni tekshiradi
  const event = await Event.findOneAndUpdate(
    { _id: id, isActive: true },
    updateData,
    { new: true, runValidators: true },
  ).populate("createdBy", "username");

  if (!event) throw new AppError("Yangilash uchun tadbir topilmadi", 404);
  // Invalidate caches related to events
  await delCache("events:all");
  await delCache(`events:${id}`);
  return event;
}

/**
 * @desc Soft Delete (O'chirish emas, holatni o'zgartirish)
 */
async function deleteEvents(id) {
  const event = await Event.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true },
  );

  if (!event) throw new AppError("O'chirish uchun tadbir topilmadi", 404);
  // Invalidate caches related to events
  await delCache("events:all");
  await delCache(`events:${id}`);
  return { success: true };
}

module.exports = {
  createEvents,
  getAllEvents,
  getEventsById,
  updateEvents,
  deleteEvents,
};
