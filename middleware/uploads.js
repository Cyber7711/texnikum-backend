const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/appError");

// Papkalar borligini tekshirish va yo'q bo'lsa yaratish funksiyasi
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others"; // Default papka

    // URL ga qarab papkani tanlash
    if (req.originalUrl.includes("/news")) {
      folder = "uploads/news";
    } else if (req.originalUrl.includes("/teachers")) {
      folder = "uploads/teachers";
    } else if (req.originalUrl.includes("/documents")) {
      folder = "uploads/documents";
    }

    // Papka borligiga ishonch hosil qilamiz (Error: ENOENT oldini olish uchun)
    ensureDir(folder);

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Fayl nomini unikal qilish: news-123456789.jpg
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Fayl turini tekshirish (Faqat rasm va hujjatlar)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new AppError("Faqat rasm yoki PDF yuklash mumkin!", 400), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
