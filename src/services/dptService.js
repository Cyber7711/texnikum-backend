const Department = require("../models/departments"); // ← singular model nomi
const AppError = require("../utils/appError");
const validateId = require("../middleware/idValidator");

// === CREATE DEPARTMENT ===
const createDpt = async (data, adminId) => {
  const { name, description, duration, teachers = [], courses = [] } = data;

  if (!name || !description || !duration) {
    throw new AppError(
      "Bo‘lim nomi, tavsifi va davomiyligi to‘ldirilishi shart",
      400
    );
  }

  // Agar bir xil nomli bo‘lim bo‘lsa oldini olish (unique index bor edi)
  const existing = await Department.findOne({ name, isActive: true });
  if (existing) {
    throw new AppError("Bu nomdagi bo‘lim allaqachon mavjud", 400);
  }

  const department = await Department.create({
    name,
    description,
    duration,
    teachers,
    courses,
    createdBy: adminId, // ← JWT dan
  });

  return department;
};

// === GET ALL (faqat faol bo‘limlar) ===
const getAllDpts = async () => {
  return await Department.find({ isActive: true })
    .sort({ createdAt: -1 })
    .populate([
      { path: "teachers", select: "fullname subject" },
      { path: "courses", select: "name" },
      { path: "createdBy", select: "username" },
    ]);
};

// === GET BY ID ===
const getDptById = async (id) => {
  validateId(id);

  const department = await Department.findOne({
    _id: id,
    isActive: true,
  }).populate([
    { path: "teachers", select: "fullname subject photo" },
    { path: "courses", select: "name duration" },
    { path: "createdBy", select: "username" },
  ]);

  if (!department) {
    throw new AppError("Bo‘lim topilmadi yoki o‘chirilgan", 404);
  }

  return department;
};

// === UPDATE DEPARTMENT ===
const updateDpt = async (id, updateData, adminId) => {
  validateId(id);

  const allowed = ["name", "description", "duration", "teachers", "courses"];
  const filtered = {};

  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      filtered[key] = updateData[key];
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new AppError("Hech qanday yangilanish ma’lumoti yuborilmadi", 400);
  }

  // Agar nom o‘zgarsa → duplicate tekshirish
  if (filtered.name) {
    const exists = await Department.findOne({
      name: filtered.name,
      _id: { $ne: id },
      isActive: true,
    });
    if (exists) {
      throw new AppError("Bu nomdagi bo‘lim allaqachon mavjud", 400);
    }
  }

  const updated = await Department.findOneAndUpdate(
    { _id: id, isActive: true },
    { ...filtered, updatedBy: adminId },
    { new: true, runValidators: true }
  ).populate([
    { path: "teachers", select: "fullname" },
    { path: "courses", select: "name" },
  ]);

  if (!updated) {
    throw new AppError("Bo‘lim topilmadi yoki yangilab bo‘lmadi", 404);
  }

  return updated;
};

// === DELETE (SOFT DELETE) ===
const deleteDpt = async (id) => {
  validateId(id);

  const department = await Department.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!department) {
    throw new AppError("Bo‘lim topilmadi yoki allaqachon o‘chirilgan", 404);
  }

  return { success: true, message: "Bo‘lim muvaffaqiyatli o‘chirildi" };
};

module.exports = {
  createDpt,
  getAllDpts,
  getDptById,
  updateDpt,
  deleteDpt,
};
