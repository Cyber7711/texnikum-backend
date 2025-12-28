// services/quickLinkService.js
const QuickLink = require("../models/quickLinks");
const AppError = require("../utils/appError");

exports.createLink = async (data, adminId) => {
  return await QuickLink.create({ ...data, createdBy: adminId });
};

exports.getAllLinks = async () => {
  return await QuickLink.find({ isActive: true }).sort({ order: 1 });
};

exports.updateLink = async (id, data) => {
  const link = await QuickLink.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!link) throw new AppError("Havola topilmadi", 404);
  return link;
};

exports.deleteLink = async (id) => {
  const link = await QuickLink.findByIdAndUpdate(id, { isActive: false });
  if (!link) throw new AppError("Havola topilmadi", 404);
  return link;
};
