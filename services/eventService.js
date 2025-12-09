const Event = require("../models/events");
const validateId = require("../middleware/idValidator");
const AppError = require("../utils/appError");

async function createEvent(data, adminId) {
  const allowedFields = [
    "name",
    "date",
    "description",
    "eventType",
    "location",
    "endDate",
    "startDate",
  ];

  filtered = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const requiredFields = ["name", "description", "startDate"];
  const missing = requiredFields.filter((field) => !filtered[field]);

  if (missing.length > 0) {
    throw new AppError(
      `Quyidagi maydon(lar) tuldirilmagan: ${missing.join(", ")}`
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
  const events = await Event.find();
  return events;
}

async function getEventById(id) {
  const event = await Event.findById(id);
  if (!event) {
    throw new Error("event topilmadi");
  }
  return event;
}

async function updateEvent(id, updateDate) {
  const event = await Event.findByIdAndUpdate(id, updateDate, { new: true });
  if (!event) {
    throw new Error("eventni yangilab bulmadi");
  }
  return event;
}

async function deleteEvent(id) {
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    throw new Error("eventni uchirib bulmadi");
  }
  return event;
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
