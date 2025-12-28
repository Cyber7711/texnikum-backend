const Teacher = require("../models/teachers");
const AppError = require("../utils/appError");
const idValidator = require("../middleware/idValidator");

class TeacherService {
  // Yaratish
  static async create(data, authorId) {
    const teacher = await Teacher.create({
      ...data,
      author: authorId, // Agar modelda author bo'lsa
    });
    return teacher;
  }

  // Hammasini olish
  static async getAll() {
    // isActive: true sharti o'chirilganlarni ko'rsatmaslik uchun
    return await Teacher.find({ isActive: true }).sort({ createdAt: -1 });
  }

  // ID bo'yicha olish
  static async getById(id) {
    idValidator(id);
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new AppError("O'qituvchi topilmadi", 404);
    }
    return teacher;
  }

  // Yangilash
  static async update(id, updateData) {
    idValidator(id);

    // Ruxsat berilgan maydonlar
    const allowedFields = [
      "fullname",
      "subject",
      "experience",
      "email",
      "phone",
      "photo",
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

    if (!updated) {
      throw new AppError("O'qituvchi topilmadi", 404);
    }
    return updated;
  }

  // O'chirish (Soft Delete)
  static async deleteTeacher(id) {
    idValidator(id);
    // Bazadan butunlay o'chirmasdan, isActive: false qilamiz (Arxivlash)
    const deleted = await Teacher.findByIdAndDelete(id);

    // Agar butunlay o'chirmoqchi bo'lsangiz, yuqoridagi qatorni o'chirib, buni yozing:
    // const deleted = await Teacher.findByIdAndDelete(id);

    if (!deleted) {
      throw new AppError(
        "O'qituvchi topilmadi yoki allaqachon o'chirilgan",
        404
      );
    }
    return deleted;
  }
}

module.exports = TeacherService;
