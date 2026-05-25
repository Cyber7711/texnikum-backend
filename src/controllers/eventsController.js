const eventServices = require("../services/eventService");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");

// 1. Event yaratish
const createEvent = catchAsync(async (req, res) => {
  // req.user._id 'protect' middleware'dan keladi
  const result = await eventServices.createEvents(req.body, req.user?._id);

  sendResponse(res, {
    status: 201,
    message: "Tadbir muvaffaqiyatli yaratildi",
    data: result,
  });
});

// 2. Hammasini olish
const getAllEvent = catchAsync(async (req, res) => {
  const result = await eventServices.getAllEvents();

  sendResponse(res, {
    status: 200,
    message:
      result.length === 0 ? "Hozircha tadbirlar yo'q" : "Tadbirlar topildi",
    results: result.length,
    data: result,
  });
});

// 3. ID bo'yicha olish
const getEventById = catchAsync(async (req, res) => {
  const result = await eventServices.getEventsById(req.params.id);

  sendResponse(res, {
    status: 200,
    data: result,
  });
});

// 4. Yangilash
const updateEvent = catchAsync(async (req, res) => {
  const result = await eventServices.updateEvents(req.params.id, req.body);

  sendResponse(res, {
    status: 200,
    message: "Tadbir yangilandi",
    data: result,
  });
});

// 5. O'chirish
const deleteEvent = catchAsync(async (req, res) => {
  await eventServices.deleteEvents(req.params.id);

  sendResponse(res, {
    status: 200,
    message: "Tadbir o'chirildi",
  });
});

module.exports = {
  createEvent,
  getAllEvent,
  getEventById,
  updateEvent,
  deleteEvent,
};
