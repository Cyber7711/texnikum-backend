const Management = require("../models/management");
const AppError = require("../utils/appError");
const validateId = require("../middleware/idValidator");

class ManagementService {
  static async getGrouped() {
    const [director, deputies, heads] = await Promise.all([
      Management.findOne({ role: "director" }).sort({ order: 1 }),
      Management.find({ role: "deputy" }).sort({ order: 1 }),
      Management.find({ role: "head" }).sort({ order: 1 }),
    ]);

    return {
      director: director || null,
      deputies,
      heads,
    };
  }

  static async getAllFlat() {
    return Management.find().sort({ role: 1, order: 1, createdAt: -1 });
  }

  static async getById(id) {
    validateId(id);
    const doc = await Management.findById(id);
    if (!doc) throw new AppError("Rahbar topilmadi", 404);
    return doc;
  }

  static async create(data) {
    return Management.create(data);
  }

  static async update(id, patch) {
    validateId(id);
    const updated = await Management.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new AppError("Yangilash uchun rahbar topilmadi", 404);
    return updated;
  }

  static async remove(id) {
    validateId(id);
    const deleted = await Management.findByIdAndDelete(id);
    if (!deleted) throw new AppError("O‘chirish uchun rahbar topilmadi", 404);
    return deleted;
  }
}

module.exports = ManagementService;
