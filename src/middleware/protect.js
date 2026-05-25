const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");

exports.protect = async (req, res, next) => {
  try {
    // 1. Tokenni cookie'dan olish
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return next(
        new AppError("Iltimos, amaliyotni bajarish uchun tizimga kiring.", 401),
      );
    }

    // 2. Tokenning yaroqliligini (hacker o'zgartirmaganligini) tekshirish
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        accessToken,
        process.env.JWT_ACCESS_SECRET,
      );
    } catch (err) {
      return next(
        new AppError(
          "Sessiya muddati tugagan yoki noto'g'ri. Qaytadan login qiling.",
          401,
        ),
      );
    }

    // 3. Bunday ID li foydalanuvchi haqiqatan ham bazada bormi? (Ehtimol o'chirib yuborilgan)
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(
        new AppError(
          "Bu token egasi bo'lgan admin tizimdan o'chirib yuborilgan.",
          401,
        ),
      );
    }

    // 4. Token berilgandan keyin admin parolini o'zgartirganmi?
    if (admin.changedPasswordAfter && admin.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "Parol yaqinda o'zgartirilgan! Iltimos, qaytadan kiring.",
          401,
        ),
      );
    }

    // Ruxsat berildi: Userni keyingi middleware/controller larga uzatamiz
    req.user = admin;
    next();
  } catch (err) {
    return next(new AppError("Ruxsatni tekshirishda xatolik yuz berdi.", 500));
  }
};
