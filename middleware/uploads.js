const multer = require("multer");

// Bizga fayl fizik xotirada emas, operativ xotirada (RAM) kerak
// Chunki biz uni darhol Uploadcare-ga jo'natamiz
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Faqat Rasm va PDF ga ruxsat
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    // Xatolik bo'lsa, uni controllerdagi catchAsync ushlaydi
    cb(new Error("Noto'g'ri format! Faqat rasm yoki PDF yuklang."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit: 10 MB
  fileFilter: fileFilter,
});

module.exports = upload;
