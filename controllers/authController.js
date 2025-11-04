const Admin = require("../models/admin");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError("Username va parol kiritilishi shart", 400));
    }
    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) return next(new AppError("Bunday admin mavjud emas", 404));

    const isMatch = await admin.correctPassword(password, admin.password);
    if (!isMatch) return next(new AppError("Noto‘g‘ri parol", 401));

    const token = signToken(admin._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Tizimga kirish muvaffaqiyatli",
      token,
    });
  } catch (err) {
    next(err);
  }
};
