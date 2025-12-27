// routes/docRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const docController = require("../controllers/docController");
const findById = require("../middleware/findById");
const Docs = require("../models/documents");
const { protect } = require("../middleware/protect");

// --- MULTER SOZLAMALARI (Fayl yuklash uchun) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/uploads/docs"; // Fayllar shu papkaga tushadi
    // Papka borligini tekshirish va yaratish
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Fayl nomini unikal qilish: doc-vaqt-originalNom
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "doc-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    // Ruxsat etilgan formatlar
    const allowedTypes =
      /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|txt|zip|rar/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname) {
      // Mimetype ba'zan farq qilishi mumkin, asosiysi extension
      return cb(null, true);
    } else {
      cb(new Error("Faqat hujjat va rasm formatlari ruxsat etilgan!"));
    }
  },
});

// --- ROUTELAR ---

// Hujjat yaratish (Fayl va ma'lumotlar bilan)
router.post("/", protect, upload.single("file"), docController.createDoc);

// Barchasini olish
router.get("/", docController.getAllDocs);

// ID bo'yicha olish
router.get("/:id", findById(Docs), docController.getDocById);

// Yangilash (Fayl ham yangilanishi mumkin)
router.put(
  "/:id",
  protect,
  upload.single("file"),
  findById(Docs),
  docController.updateDoc
);

// O'chirish
router.delete("/:id", protect, findById(Docs), docController.deleteDoc);

module.exports = router;
