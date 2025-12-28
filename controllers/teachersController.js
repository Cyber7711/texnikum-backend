const TeacherService = require("../services/teacherService");
const Teacher = require("../models/teachers");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const uploadToCloud = require("../utils/upload");
const deleteFromCloud = require("../utils/deleteFile");

const create = catchAsync(async (req, res) => {
  const photoUUID = req.file ? await uploadToCloud(req.file) : null;

  const teacherData = {
    ...req.body,
    photo: photoUUID,
  };

  const result = await TeacherService.create(teacherData);

  sendResponse(res, {
    status: 201,
    message: "O\u2018qituvchi yaratildi",
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  if (req.file) {
    const oldTeacher = await Teacher.findById(req.params.id);
    if (oldTeacher?.photo) {
      await deleteFromCloud(oldTeacher.photo);
    }

    req.body.photo = await uploadToCloud(req.file);
  }

  const result = await TeacherService.update(req.params.id, req.body);

  sendResponse(res, {
    status: 200,
    message: "Yangilandi",
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (teacher?.photo) {
    await deleteFromCloud(teacher.photo);
  }

  await TeacherService.deleteTeacher(req.params.id);

  sendResponse(res, {
    status: 200,
    message: "O\u2018chirildi",
  });
});

const deleteAll = async (req, res) => {
  const Teacher = require("../models/teachers");
  await Teacher.deleteMany({}); // Hammasini o'chiradi
  res.status(200).json({ message: "Baza tozalandi! 🗑️" });
};

module.exports = {
  create,
  update,

  deleteTeacher,
  deleteAll,
  getAll: catchAsync(async (req, res) => {
    const result = await TeacherService.getAll();
    sendResponse(res, { status: 200, data: result });
  }),
  getById: catchAsync(async (req, res) => {
    const result = await TeacherService.getById(req.params.id);
    sendResponse(res, { status: 200, data: result });
  }),
};
