const { default: mongoose } = require("mongoose");
const Teacher = require("../models/teachers");
const AppError = require("../utils/appError");

async function createTeacher(data) {
  const { fullname, subject, experience, email } = data;
  const missingFields = [];
  if (!fullname) missingFields.push("fullname");
  if (!subject) missingFields.push("subject");
  if (!experience) missingFields.push("experience");
  if (!email) missingFields.push("email");

  if (missingFields.length > 0) {
    throw new AppError(
      `Quyidagi maydon(lar) to‘ldirilmagan: ${missingFields.join(", ")}`,
      400
    );
  }

  const existingTeacher = await Teacher.findOne({ email });
  if (existingTeacher) {
    throw new AppError("bu email allaqachon ruyxatdan utgan", 400);
  }

  const teachers = new Teacher({ fullname, subject, experience, email });
  return await teachers.save();
}

async function getAllTeachers() {
  const teachers = await Teacher.find({ isActive: true });
  return teachers;
}

async function getTeacherById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("notugri ID formati", 400);
  }
  const teachers = await Teacher.findById(id);
  if (!teachers) {
    throw new AppError("bunday Uqituvchi yuq", 400);
  }
  return teachers;
}

async function updateTeacher(id, updateData) {
  const allowedFields = [
    "fullname",
    "subject",
    "experience",
    "email",
    "isActive",
  ];
  const filteredData = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }
  const teachers = await Teacher.findByIdAndUpdate(id, filteredData, {
    new: true,
    runValidators: true,
  });
  if (!teachers) {
    throw new AppError("Uqituvchini yangilab bulmadi", 400);
  }
  return teachers;
}

async function deleteTeacher(id) {
  const teachers = await Teacher.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!teachers) {
    throw new AppError("Teacherni uchirib bulmadi", 400);
  }
  return { message: "Teacher faol holatdan chiqarildi", teachers };
}

const teacherService = {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};

module.exports = teacherService;
