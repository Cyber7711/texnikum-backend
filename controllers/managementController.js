const ManagementService = require("../services/managementService");
const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/appError");
const uploadToCloud = require("../utils/upload");
const deleteFromCloud = require("../utils/deleteFile");

// GET /api/management (PUBLIC) -> grouped
exports.getManagement = catchAsync(async (req, res) => {
  const data = await ManagementService.getGrouped();
  res.status(200).json({ status: "success", data });
});

// GET /api/management/all (ADMIN optional) -> flat
exports.getAllFlat = catchAsync(async (req, res) => {
  const data = await ManagementService.getAllFlat();
  res.status(200).json({ status: "success", results: data.length, data });
});

// POST /api/management (ADMIN)
exports.createManagement = catchAsync(async (req, res, next) => {
  if (!req.user?._id) {
    return next(new AppError("Avtorizatsiya yo‘q. Qayta login qiling.", 401));
  }

  let imageUUID = null;
  if (req.file) imageUUID = await uploadToCloud(req.file);

  const payload = {
    name: req.body.name,
    position: req.body.position,
    role: req.body.role,
    phone: req.body.phone || null,
    email: req.body.email || null,
    reception: req.body.reception || null,
    bio: req.body.bio || null,
    education: req.body.education || null,
    experience: req.body.experience || null,
    iconKey: req.body.iconKey || null,
    order: Number(req.body.order || 0),
    image: imageUUID,
    author: req.user._id,
  };

  const created = await ManagementService.create(payload);
  res.status(201).json({ status: "success", data: created });
});

// PATCH /api/management/:id (ADMIN)
exports.updateManagement = catchAsync(async (req, res) => {
  const old = await ManagementService.getById(req.params.id);

  const patch = {
    name: req.body.name,
    position: req.body.position,
    role: req.body.role,
    phone: req.body.phone,
    email: req.body.email,
    reception: req.body.reception,
    bio: req.body.bio,
    education: req.body.education,
    experience: req.body.experience,
    iconKey: req.body.iconKey,
    order: req.body.order !== undefined ? Number(req.body.order) : undefined,
  };

  // undefined maydonlarni olib tashla
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

  if (req.file) {
    const newUuid = await uploadToCloud(req.file);
    patch.image = newUuid;

    if (old.image) {
      deleteFromCloud(old.image).catch((e) =>
        console.error("Old management image delete error:", e),
      );
    }
  }

  const updated = await ManagementService.update(req.params.id, patch);
  res.status(200).json({ status: "success", data: updated });
});

// DELETE /api/management/:id (ADMIN)
exports.deleteManagement = catchAsync(async (req, res) => {
  const doc = await ManagementService.getById(req.params.id);

  if (doc.image) {
    await deleteFromCloud(doc.image);
  }

  await ManagementService.remove(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
