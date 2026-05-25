const Stats = require("../models/statistics");
const AppError = require("../utils/appError");
const idValidator = require("../middleware/idValidator");

class StatsService {
  static async create(data, authorId) {
    const stats = await Stats.create({
      ...data,
      author: authorId,
    });
    return stats;
  }
  static async getAll() {
    return await Stats.find().sort({ date: -1 });
  }
  static async getById(id) {
    idValidator(id);

    const stats = await Stats.findById(id);
    if (!stats) {
      throw new AppError("Statistika  topilmadi", 404);
    }
    return stats;
  }
  static async update(id, updateData) {
    idValidator(id);

    const allowedFields = ["year", "students", "graduates"];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updated = await Stats.findByIdAndUpdate(id, filteredData, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updated) {
      throw new AppError("Statistikani topilmadi", 400);
    }
    return updated;
  }
  static async delete(id) {
    idValidator(id);
    const deleted = await Stats.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError("Statistikani yangilab bulmadi", 400);
    }
    return deleted;
  }
}

module.exports = StatsService;
