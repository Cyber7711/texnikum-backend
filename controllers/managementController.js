const ManagementService = require("../services/managementService");
const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/appError");
const uploadToCloud = require("../utils/upload");
const deleteFromCloud = require("../utils/deleteFile");

// Public: GET /api/management
exports.getManagement = catchAsync(async (req, res) => {
  await ManagementService.ensureSeed();
  const doc = await ManagementService.getOne();

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

// Admin: PATCH /api/management/leader/:leaderId
exports.updateLeader = catchAsync(async (req, res, next) => {
  if (!req.user?._id) {
    return next(new AppError("Avtorizatsiyadan o'tilmagan", 401));
  }

  const { leaderId } = req.params;

  // Old doc (eski rasmni o‘chirish uchun)
  const oldDoc = await ManagementService.getOne();
  const found = ManagementService.findLeader(oldDoc, leaderId);
  if (!found) return next(new AppError("Bunday leaderId topilmadi", 404));

  let updateData = { ...req.body };

  // image upload (Uploadcare)
  if (req.file) {
    const newUUID = await uploadToCloud(req.file);
    updateData.image = newUUID;

    // eski rasm bo‘lsa o‘chiramiz (background)
    if (found.leader.image) {
      deleteFromCloud(found.leader.image).catch((e) =>
        console.error("Old image delete error:", e),
      );
    }
  }

  const updated = await ManagementService.updateLeader(leaderId, updateData);

  res.status(200).json({
    status: "success",
    message: "Rahbariyat ma'lumoti yangilandi",
    data: updated,
  });
});
