// middleware/uploads.js
const multer = require("multer");
const AppError = require("../utils/appError");

// Operativ xotira (RAM) dan foydalanamiz, bu Supabase uchun optimal usul
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Ruxsat etilgan fayl turlari: Rasmlar, PDF, Word hujjatlari
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Controllerdagi error handler buni tutib oladi
    cb(
      new AppError(
        "Faqat Rasm (JPEG, PNG, WEBP, SVG), PDF yoki Word fayl yuklash mumkin!",
        400,
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit: 10 MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
