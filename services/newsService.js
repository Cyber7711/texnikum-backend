const News = require("../models/news"); //
const AppError = require("../utils/appError"); //
const validateId = require("../middleware/idValidator"); //

class NewsService {
  static async createNews(data, authorId) {
    const news = await News.create({
      ...data,
      author: authorId,
    });
    return news;
  }

  static async getAllNews() {
    return await News.find().sort({ date: -1 });
  }

  static async getNewsById(id) {
    validateId(id);
    const news = await News.findById(id);
    if (!news) throw new AppError("Yangilik topilmadi", 404);
    return news;
  }

  static async updateNews(id, updateData) {
    validateId(id);

    // Allowed fields ichida 'image' UUID sifatida keladi
    const allowedFields = [
      "title",
      "content",
      "image",
      "isActive",
      "isPublished",
    ];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updatedNews = await News.findByIdAndUpdate(id, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews) throw new AppError("Yangilik topilmadi", 404);
    return updatedNews;
  }

  static async deleteNews(id) {
    validateId(id);
    const deletedNews = await News.findByIdAndDelete(id);
    if (!deletedNews) throw new AppError("Yangilik topilmadi", 404);
    return deletedNews;
  }
}

module.exports = NewsService;
