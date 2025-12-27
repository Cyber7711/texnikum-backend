const TeacherService = require("../services/teacherService"); // Nomni to'g'riladik
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");

const create = catchAsync(async (req, res, next) => {
  let imagePath = null;

  // RASM YO'LINI SAQLASH MANTIQI
  if (req.file) {
    // Windows/Linux farqini yo'qotish uchun replace ishlatamiz
    // Natija: /uploads/teachers/rasm.jpg
    imagePath = `/uploads/teachers/${req.file.filename}`;
  }

  const teacherData = {
    fullname: req.body.fullname,
    subject: req.body.subject,
    experience: req.body.experience,
    email: req.body.email,
    phone: req.body.phone,
    photo: imagePath, // Modelda "photo" deb nomlangan
  };

  // Muallif ID sini qo'shish (ixtiyoriy)
  const authorId = req.user ? req.user._id : null;

  const result = await TeacherService.create(teacherData, authorId);

  sendResponse(res, {
    status: 201,
    message: "O'qituvchi muvaffaqiyatli yaratildi",
    data: result,
  });
});

const getAll = catchAsync(async (req, res) => {
  const result = await TeacherService.getAll();
  sendResponse(res, {
    status: 200,
    message: "O'qituvchilar ro'yxati",
    data: result,
  });
});
// DIQQAT: Bu funksiya bazadagi BARCHA o'qituvchilarni butunlay o'chirib yuboradi!
const dangerDeleteAllTeachers = catchAsync(async (req, res, next) => {
  const Teacher = require("../models/teachers"); // Modelni import qilamiz

  // deleteMany({}) buyrug'i bazani tozalaydi
  const result = await Teacher.deleteMany({});

  res.status(200).json({
    success: true,
    message: `Barcha o'qituvchilar o'chirildi. Jami: ${result.deletedCount} ta`,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await TeacherService.getById(req.params.id);
  sendResponse(res, {
    status: 200,
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.photo = `/uploads/teachers/${req.file.filename}`;
  }

  const result = await TeacherService.update(req.params.id, req.body);
  sendResponse(res, {
    status: 200,
    message: "O'qituvchi ma'lumotlari yangilandi",
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req, res) => {
  // Service dagi funksiya nomini to'g'ri chaqiramiz:
  await TeacherService.deleteTeacher(req.params.id);

  sendResponse(res, {
    status: 200, // 204 qilsangiz frontendga hech narsa qaytmaydi, 200 yaxshiroq
    message: "O'qituvchi muvaffaqiyatli o'chirildi",
    success: true,
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteTeacher,
};
