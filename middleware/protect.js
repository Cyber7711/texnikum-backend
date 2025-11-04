const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

exports.protect = (req, res, next) => {
  const token =
    req.cookies?.jwt ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) return next(new AppError("Token topilmadi", 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Token yaroqsiz yoki muddati tugagan", 401));
  }
};
