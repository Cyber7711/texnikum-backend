const Applicant = require("../models/applicant");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");

// 1. Yangi ariza topshirish (Hamma uchun)
exports.createApplicant = catchAsync(async (req, res) => {
  const result = await Applicant.create(req.body);
  sendResponse(res, {
    status: 201,
    message: "Arizangiz qabul qilindi!",
    data: result,
  });
});

// 2. Barcha arizalarni olish (Faqat Admin uchun)
exports.getAllApplicants = catchAsync(async (req, res) => {
  const result = await Applicant.find().sort({ createdAt: -1 });
  sendResponse(res, {
    status: 200,
    data: result,
  });
});

// 3. Arizani o'chirish (Admin)
exports.deleteApplicant = catchAsync(async (req, res) => {
  await Applicant.findByIdAndDelete(req.params.id);
  sendResponse(res, {
    status: 200,
    message: "Ariza o'chirildi",
  });
});
