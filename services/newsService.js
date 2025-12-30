const News = require("../models/news");
const AppError = require("../utils/appError");
const validateId = require("../middleware/idValidator"); // MongoDB ID validatsiyasi

class NewsService {
  // Yaratish
  static async createNews(data) {
    const news = await News.create(data);
    return news;
  }

  // Hammasini olish (Sanasi bo'yicha yangisi tepada)
  static async getAllNews() {
    return await News.find()
      .populate("author", "fullname email") // Author ma'lumotlarini qo'shib jo'natadi
      .sort({ createdAt: -1 }); // Yoki 'date': -1
  }

  // Bittasini olish
  static async getNewsById(id) {
    validateId(id);
    const news = await News.findById(id).populate("author", "fullname email");

    if (!news) {
      throw new AppError("Bunday ID bilan yangilik topilmadi", 404);
    }
    return news;
  }

  // Yangilash
  static async updateNews(id, updateData) {
    validateId(id);

    // Xavfsizlik: Faqat ruxsat berilgan maydonlarni yangilash
    const allowedFields = [
      "title",
      "content",
      "image",
      "isActive",
      "isPublished",
    ];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    });

    const updatedNews = await News.findByIdAndUpdate(id, filteredData, {
      new: true, // Yangilangan ma'lumotni qaytaradi
      runValidators: true, // Model validatsiyasini ishlatadi
    });

    if (!updatedNews) {
      throw new AppError("Yangilash uchun yangilik topilmadi", 404);
    }
    return updatedNews;
  }

  // O'chirish
  static async deleteNews(id) {
    validateId(id);
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      throw new AppError("O'chirish uchun yangilik topilmadi", 404);
    }
    return deletedNews;
  }
}

module.exports = NewsService;
