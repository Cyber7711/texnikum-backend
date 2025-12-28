// controllers/quickLinkController.js
const quickLinkService = require("../services/quickLinkService");

exports.createLink = async (req, res, next) => {
  try {
    const result = await quickLinkService.createLink(req.body, req.user._id);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getAllLinks = async (req, res, next) => {
  try {
    const result = await quickLinkService.getAllLinks();
    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
};

exports.deleteLink = async (req, res, next) => {
  try {
    await quickLinkService.deleteLink(req.params.id);
    res.status(200).json({ success: true, message: "O'chirildi" });
  } catch (err) {
    next(err);
  }
};
