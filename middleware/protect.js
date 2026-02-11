const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");
const catchAsync = require("../middleware/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // ✅ 1) Cookie'dan o‘qiymiz (asosiy)
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  // ✅ 2) Fallback: Bearer header
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Siz tizimga kirmagansiz! Iltimos login qiling.", 401),
    );
  }

  // ⚠️ Secret nomi sening authController’ingda JWT_ACCESS_SECRET edi
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_ACCESS_SECRET,
  );

  const currentUser = await Admin.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("Token egasi (Admin) bazadan o'chirilgan.", 401));
  }

  req.user = currentUser;
  next();
});
