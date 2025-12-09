const Event = require("../models/event");
const validateId = require("../middleware/idValidator");
const AppError = require("../utils/appError");

async function createEvent(data, adminId) {
  const allowedFields = [
    "name",
    "description",
    "startDate",
    "endDate",
    "eventType",
    "location",
    "isPublished",
  ];
  const filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const requiredFields = ["name", "description", "startDate"];
  const missing = requiredFields.filter((field) => !filtered[field]);

  if (missing.length > 0) {
    throw new AppError(
      `Quyidagi maydon(lar) tuldirilmagan: ${missing.join(", ")}`,
      400
    );
  }

  const event = await Event.create({
    ...filtered,
    createdBy: adminId,
    isPublished: filtered.isPublished ?? true,
  });

  return event;
}

async function getAllEvents() {
  const now = new Date();
  return await Event.find({
    isActive: true,
    isPublished: true,
    startDate: { $gte: now },
  })
    .sort({
      startDate: 1,
    })
    .limit(20)
    .select("name description startDate endDate location eventType")
    .populate("createdBy", "username");
}

async function getEventById(id) {
  validateId(id);
  const event = await Event.findOne({ _id: id, isActive: true }).populate(
    "createdBy",
    "username"
  );
  if (!event) {
    throw new AppError("Event topilmadi", 404);
  }
  return event;
}

async function updateEvent(id, updateDate, adminId) {
  validateId(id);

  const allowedFields = [
    "name",
    "description",
    "startDate",
    "endDate",
    "eventType",
    "location",
    "isPublished",
  ];

  const filtered = {};

  for (const key of allowedFields) {
    if (updateDate[key] !== undefined) {
      filtered[key] = updateDate[key];
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new AppError("Hech qanday yangilanish ma’lumoti yuborilmadi", 400);
  }
  const event = await Event.findOneAndUpdate(
    { _id: id, isActive: true },
    filtered,
    {
      new: true,
      runValidators: true,
    }
  ).populate("createdBy", "username");

  if (!event) {
    throw new AppError("Eventni yangilab bulmadi", 404);
  }
  return event;
}

async function deleteEvent(id) {
  validateId(id);
  const event = await Event.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  );
  if (!event) {
    throw new AppError("Eventni uchirib bulmadi", 404);
  }
  return { success: true, message: "Event muvaffaqiyatli uchirildi" };
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
