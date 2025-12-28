const TeacherService = require("../services/teacherService");
const Teacher = require("../models/teachers");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const uploadToCloud = require("../utils/upload"); // utils/upload.js ekanligiga ishonch hosil qiling
const deleteFromCloud = require("../utils/deleteFile");

// 1. Hammasini olish
const getAll = catchAsync(async (req, res) => {
  const result = await TeacherService.getAll();
  sendResponse(res, {
    status: 200,
    results: result.length,
    data: result,
  });
});

// 2. ID bo'yicha olish
const getById = catchAsync(async (req, res) => {
  const result = await TeacherService.getById(req.params.id);
  sendResponse(res, {
    status: 200,
    data: result,
  });
});

// 3. Yaratish
const create = catchAsync(async (req, res) => {
  // Rasm yuklash (Uploadcare)
  const photoUUID = req.file ? await uploadToCloud(req.file) : null;

  const teacherData = {
    ...req.body,
    photo: photoUUID,
  };

  const result = await TeacherService.create(teacherData);

  sendResponse(res, {
    status: 201,
    message: "O‘qituvchi muvaffaqiyatli yaratildi",
    data: result,
  });
});

// 4. Yangilash
const update = catchAsync(async (req, res) => {
  const oldTeacher = await Teacher.findById(req.params.id);

  if (req.file) {
    // Yangi rasmni yuklaymiz
    const newPhotoUUID = await uploadToCloud(req.file);
    req.body.photo = newPhotoUUID;

    // Eskisini o'chirib tashlaymiz
    if (oldTeacher?.photo) {
      await deleteFromCloud(oldTeacher.photo);
    }
  }

  const result = await TeacherService.update(req.params.id, req.body);

  sendResponse(res, {
    status: 200,
    message: "O‘qituvchi ma'lumotlari yangilandi",
    data: result,
  });
});

// 5. O'chirish
const deleteTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (teacher?.photo) {
    await deleteFromCloud(teacher.photo);
  }

  await TeacherService.deleteTeacher(req.params.id);

  sendResponse(res, {
    status: 200,
    message: "O‘qituvchi bazadan o'chirildi",
  });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteTeacher,
};
