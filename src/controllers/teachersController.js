const TeacherService = require("../services/teacherService");
const Teacher = require("../models/teachers");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const uploadToCloud = require("../utils/upload");
const deleteFromCloud = require("../utils/deleteFile");

const getAll = catchAsync(async (req, res) => {
  const result = await TeacherService.getAll();
  sendResponse(res, {
    status: 200,
    results: result.length,
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await TeacherService.getById(req.params.id);
  sendResponse(res, {
    status: 200,
    data: result,
  });
});

const create = catchAsync(async (req, res) => {
  // Rasm yuklash (Supabase orqali)
  let photoName = null;
  if (req.file) {
    photoName = await uploadToCloud(req.file);
  }

  const teacherData = {
    ...req.body,
    photo: photoName,
  };

  const result = await TeacherService.create(teacherData);

  sendResponse(res, {
    status: 201,
    message: "O‘qituvchi muvaffaqiyatli yaratildi",
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  const oldTeacher = await Teacher.findById(req.params.id);

  if (req.file) {
    // Yangi rasmni yuklaymiz
    const newPhotoName = await uploadToCloud(req.file);
    req.body.photo = newPhotoName;

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

const deleteTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (teacher?.photo) {
    // Avval bulutdan (Supabase), keyin bazadan o'chiramiz
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
