// middleware/upload.js
const multer = require("multer");
const path = require("path");

// Ruxsat etilgan fayl turlari
const allowedMimes = [
  // PDF
  "application/pdf",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Rasmlar
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",

  // Arxivlar
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",

  // Matn
  "text/plain",
];

// Fayl nomini tozalash va o‘zbekcha belgilarni saqlash
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/documents/"); // bu papka oldindan yaratilgan bo‘lishi kerak!
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s\-_]/g, "") // taqiqlangan belgilarni o‘chiradi
      .trim()
      .replace(/\s+/g, "-");

    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Fayl filteri – XAVFSIZLIK UCHUN ENDI ENG MUHIM QISM!
const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Ruxsat etilmagan fayl turi! Faqat PDF, Word, Excel, PowerPoint, rasm va arxiv fayllar yuklanadi."
      ),
      false
    );
  }
};

// Hajm limiti – 20 MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

module.exports = upload;
