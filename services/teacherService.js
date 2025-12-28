const Teacher = require("../models/teachers"); //
const AppError = require("../utils/appError");
const idValidator = require("../middleware/idValidator");

class TeacherService {
  // 1. O'qituvchi yaratish
  static async create(data) {
    // Controllerda photoUUID tayyorlab beriladi
    const teacher = await Teacher.create(data);
    return teacher;
  }

  // 2. Hammasini olish (Faqat faollarini)
  static async getAll() {
    return await Teacher.find({ isActive: true }).sort({ createdAt: -1 });
  }

  // 3. ID bo'yicha olish
  static async getById(id) {
    idValidator(id);
    const teacher = await Teacher.findById(id);
    if (!teacher) throw new AppError("O'qituvchi topilmadi", 404);
    return teacher;
  }

  // 4. Yangilash
  static async update(id, updateData) {
    idValidator(id);

    // Faqat ruxsat berilgan maydonlarni filtrlaymiz
    const allowedFields = [
      "fullname",
      "subject",
      "experience",
      "email",
      "phone",
      "photo", // UUID sifatida keladi
      "isActive",
    ];

    const filteredData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updated = await Teacher.findByIdAndUpdate(id, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new AppError("O'qituvchi topilmadi", 404);
    return updated;
  }

  // 5. O'chirish (Hard Delete)
  static async deleteTeacher(id) {
    idValidator(id);
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) throw new AppError("O'qituvchi topilmadi", 404);
    return deleted;
  }
}

module.exports = TeacherService;
