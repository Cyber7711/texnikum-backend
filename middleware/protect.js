const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Admin = require("../models/admin"); // Admin model manzili to'g'riligini tekshiring!
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync"); // Agar catchAsync bo'lmasa, try-catch ishlating

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Tokenni headerdan olish
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Siz tizimga kirmagansiz! Iltimos login qiling.", 401)
    );
  }

  // 2. Tokenni tekshirish (Verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Token egasi (Admin) hali ham bormi?
  const currentUser = await Admin.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("Token egasi (Admin) bazadan o'chirilgan.", 401));
  }

  // 4. MUHIM: Foydalanuvchini req ga biriktiramiz
  req.user = currentUser;

  // Keyingi bosqichga o'tish
  next();
});
