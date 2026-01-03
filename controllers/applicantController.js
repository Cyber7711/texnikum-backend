const Applicant = require("../models/applicant");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const AppError = require("../utils/appError"); // Xatolarni boshqarish uchun

// 1. Yangi ariza topshirish (Takrorlanishdan himoyalangan)
exports.createApplicant = catchAsync(async (req, res, next) => {
  const { phone, fullname, direction } = req.body;

  // Telefon raqami bo'shliqlardan tozalanadi (Formatlash uchun)
  const cleanPhone = phone ? phone.replace(/\s/g, "") : "";

  // 1. Shu raqam bazada bor-yo'qligini tekshiramiz
  const existingApplicant = await Applicant.findOne({ phone: cleanPhone });

  if (existingApplicant) {
    // 400 xatosi: Foydalanuvchi aybi bilan bo'lgan xatolik
    return next(
      new AppError("Bu telefon raqami orqali allaqachon ariza yuborilgan!", 400)
    );
  }

  // 2. Yangi ariza yaratish
  const result = await Applicant.create({
    fullname,
    phone: cleanPhone,
    direction,
  });

  sendResponse(res, {
    status: 201,
    message: "Arizangiz muvaffaqiyatli qabul qilindi!",
    data: result,
  });
});

// 2. Barcha arizalarni olish (Faqat Admin uchun)
exports.getAllApplicants = catchAsync(async (req, res) => {
  // Sahifalash (pagination) qo'shish ham foydali bo'lishi mumkin
  const result = await Applicant.find().sort({ createdAt: -1 });

  sendResponse(res, {
    status: 200,
    data: result,
  });
});

// 3. Arizani o'chirish (Admin)
exports.deleteApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findByIdAndDelete(req.params.id);

  if (!applicant) {
    return next(new AppError("Bunday ID bilan ariza topilmadi", 404));
  }

  sendResponse(res, {
    status: 200,
    message: "Ariza muvaffaqiyatli o'chirildi",
  });
});
