const announcementService = require("../services/announcementService");

const createAnnouncement = async (req, res, next) => {
  try {
    const result = await announcementService.createAnnouncement(req.body);

    res.status(201).json({
      success: true,
      message: "E'lon muvaffaqiyatli yaratildi",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await announcementService.getAllAnnouncements();

    if (!announcements.length) {
      return res.status(204).send();
    }

    res.status(200).json({
      success: true,
      count: announcements.length,
      message: "E'lonlar muvaffaqiyatli olindi",
      data: announcements,
    });
  } catch (err) {
    next(err);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const result = await announcementService.getAnnouncementById(req.params.id);

    res.status(200).json({
      success: true,
      message: "E'lon muvaffaqiyatli olindi",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const result = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "E'lon muvaffaqiyatli yangilandi",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);

    res.status(200).json({
      success: true,
      message: "E'lon muvaffaqiyatli o'chirildi",
    });
  } catch (err) {
    next(err);
  }
};
const announcementsController = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
module.exports = announcementsController;
