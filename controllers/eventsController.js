const eventServices = require("../services/eventService");
const appError = require("../utils/appError");

const createEvent = async (req, res, next) => {
  try {
    const result = await eventServices.createEvents(req.body);
    if (!result) {
      throw new appError("event yaratib bulmadi", 400);
    }
    res.status(201).json({ message: "event muvaffaqiyatli yaratildi", result });
  } catch (err) {
    next(err);
  }
};

const getAllEvent = async (req, res, next) => {
  try {
    const result = await eventServices.getAllEvents();
    if (result.length === 0) {
      return res
        .status(200)
        .json({ message: "hozircha eventlar yuq", result: [] });
    }
    res
      .status(200)
      .json({ message: "eventlar muvaffaqiyatli topildi", result });
  } catch (err) {
    next(err);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const result = await eventServices.getEventsById(req.params.id);
    if (!result) throw new appError("Event topilmadi", 404);

    res.status(200).json({
      message: "event id si buyicha muvaffaqiytli olindi",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const result = await eventServices.updateEvents(req.params.id, req.body);
    if (!result) throw new appError("Event topilmadi", 404);
    res
      .status(200)
      .json({ message: "event muvaffaiyatli uzgartirildi", result });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const result = await eventServices.deleteEvents(req.params.id);
    if (!result) throw new appError("Event topilmadi", 404);
    res.status(200).json({ message: "event muvaffaqiyatli uchirildi", result });
  } catch (err) {
    next(err);
  }
};

const eventsController = {
  createEvent,
  getAllEvent,
  getEventById,
  updateEvent,
  deleteEvent,
};

module.exports = eventsController;
