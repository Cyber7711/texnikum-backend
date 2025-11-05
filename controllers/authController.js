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

    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) return res.status(404).json({ message: "Admin topilmadi" });

    const isMatch = await admin.correctPassword(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Parol noto‘g‘ri" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log("✅ Token yaratildi:", token.slice(0, 20), "...");

    res.status(200).json({
      status: "success",
      message: "Kirish muvaffaqiyatli",
      token,
    });
    console.log("🧠 Login kelib tushdi:", req.body);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
};
