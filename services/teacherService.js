const validateId = require("../middleware/idValidator");
const Teacher = require("../models/teachers");
const AppError = require("../utils/appError");

class TeacherSevice {
  static async create(data, authorId) {
    const teacher = await Teacher.create({
      ...data,
      author: authorId,
    });
    return teacher;
  }
  static async getAll() {
    return await Teacher.find().sort({ date: -1 });
  }
  static async getById(id) {
    validateId(id);
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new AppError("Uqituvchi topilmadi", 404);
    }
    return teacher;
  }
  static async update(id, updateData) {
    validateId(id);

    const allowedFields = [
      "fullname",
      "subject",
      "experience",
      "email",
      "phone",
      "photo",
    ];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) filteredData[key] = updateData[key];
    });

    const update = await Teacher.findByIdAndUpdate(id, filteredData, {
      new: true,
      runValidators: true,
    });
    if (!update) {
      throw new AppError("Uqituvchini yangilanshda xatolik", 400);
    }
    return update;
  }
  static async delete(id) {
    validateId(id);

    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      throw new AppError("Uqituvchini uchiishda xatolik", 400);
    }
    return teacher;
  }
}

module.exports = TeacherSevice;
