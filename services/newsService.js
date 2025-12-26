const News = require("../models/news");
const AppError = require("../utils/appError");
const validateId = require("../middleware/idValidator");

class NewsService {
  // 1. Yangilik yaratish
  static async createNews(data, authorId) {
    // Ma'lumotlar bazasiga yozish
    const news = await News.create({
      ...data,
      author: authorId, // Muallifni shu yerda qo'shamiz
    });
    return news;
  }

  // 2. Hammasini olish
  static async getAllNews() {
    // Eng yangilari tepadaga chiqishi uchun .sort() qo'shdim
    return await News.find().sort({ date: -1 });
  }

  // 3. ID bo'yicha olish
  static async getNewsById(id) {
    // ID formati to'g'riligini tekshiramiz
    validateId(id);

    const news = await News.findById(id);
    if (!news) {
      throw new AppError("Yangilik topilmadi", 404);
    }
    return news;
  }

  // 4. Yangilash
  static async updateNews(id, updateData) {
    validateId(id);

    // Faqat ruxsat berilgan maydonlarni ajratib olamiz
    const allowedFields = ["title", "content", "image", "isActive"];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updatedNews = await News.findByIdAndUpdate(id, filteredData, {
      new: true, // Yangilangan versiyani qaytarish
      runValidators: true, // Model validatsiyasini ishlatish
    });

    if (!updatedNews) {
      throw new AppError("Yangilik topilmadi", 404);
    }

    return updatedNews;
  }

  // 5. O'chirish
  static async deleteNews(id) {
    validateId(id);
    const deletedNews = await News.findByIdAndDelete(id);
    if (!deletedNews) {
      throw new AppError("Yangilik topilmadi", 404);
    }
    return deletedNews;
  }
}

module.exports = NewsService;
