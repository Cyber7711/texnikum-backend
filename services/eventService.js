const Event = require("../models/events");

async function createEvents(data) {
  const { name, date, description } = data;
  if (!name) {
    throw new Error("name yozilishi shart !");
  }

  const events = new Event({
    name,
    date,
    description,
  });

  return await events.save();
}

async function getAllEvents() {
  const events = await Event.find();
  return events;
}

async function getEventsById(id) {
  const event = await Event.findById(id);
  if (!event) {
    throw new Error("event topilmadi");
  }
  return event;
}

async function updateEvents(id, updateDate) {
  const event = await Event.findByIdAndUpdate(id, updateDate, { new: true });
  if (!event) {
    throw new Error("eventni yangilab bulmadi");
  }
  return event;
}

async function deleteEvents(id) {
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    throw new Error("eventni uchirib bulmadi");
  }
  return event;
}

module.exports = {
  createEvents,
  getAllEvents,
  getEventsById,
  updateEvents,
  deleteEvents,
};
