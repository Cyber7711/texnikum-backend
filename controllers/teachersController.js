const catchAsync = require("../middleware/catchAsync");
const teacherService = require("../services/teacherService");
const AppError = require("../utils/appError");

const createTeacher = catchAsync(async (req, res) => {
  const result = await teacherService.create(req.body);
});

const getAllTeachers = async (req, res, next) => {
  try {
    const result = await teacherService.getAllTeachers();
    if (!result || result.length === 0) {
      res.status(204).json({
        message: "hozircha uqituvchilar yuq",
        result: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Teacherlar muvaffaqiyatli olindi",
      result,
    });
  } catch (err) {
    return next(err);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const result = await teacherService.getTeacherById(req.params.id);
    if (!result) {
      throw new AppError("Teacherni olishda xatolik", 404);
    }
    res.status(200).json({
      success: true,
      message: "Teacher muvafffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const result = await teacherService.updateTeacher(req.params.id, req.body);
    if (!result) {
      throw new AppError("Teacherni yangilashda xatolik", 400);
    }
    res.status(200).json({
      success: true,
      message: "Teacher muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const result = await teacherService.deleteTeacher(req.params.id);
    if (!result) {
      throw new AppError("Teacherni uchirishda xatolik", 400);
    }
    res.status(204).json({
      success: true,
      message: "Teacher muvaffaqiyatli uchirildi",
    });
  } catch (err) {
    return next(err);
  }
};

const teacherController = {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};

module.exports = teacherController;
