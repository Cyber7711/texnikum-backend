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
  // protect middleware req.user ni allaqachon tekshirgan bo'lishi kerak
  let imageUUID = null;
  if (req.file) imageUUID = await uploadToCloud(req.file);

  const payload = {
    ...req.body, // spread operator orqali barcha maydonlarni olish mumkin
    order: Number(req.body.order || 0),
    image: imageUUID,
    author: req.user._id,
  };

  // payload ichidan ortiqcha narsalar ketmasligi uchun model validate qiladi
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
    // Bo'sh string kelishidan himoya
    order:
      req.body.order !== undefined && req.body.order !== ""
        ? Number(req.body.order)
        : undefined,
  };

  // Undefined maydonlarni tozalash
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

  // Rasmni boshqarish
  if (req.file) {
    const newUuid = await uploadToCloud(req.file);
    patch.image = newUuid;
  }

  // Avval bazani yangilaymiz
  const updated = await ManagementService.update(req.params.id, patch);

  // Agar yangilanish muvaffaqiyatli bo'lsa va yangi rasm yuklangan bo'lsa, keyin eskisin o'chiramiz
  if (req.file && old.image) {
    deleteFromCloud(old.image).catch((e) =>
      console.error("Old management image delete error:", e),
    );
  }

  res.status(200).json({ status: "success", data: updated });
});

// DELETE /api/management/:id (ADMIN)
exports.deleteManagement = catchAsync(async (req, res) => {
  // 1. Avval topamiz
  const doc = await ManagementService.getById(req.params.id);

  // 2. Bazadan o'chiramiz
  await ManagementService.remove(req.params.id);

  // 3. Agar bazadan muvaffaqiyatli o'chsa, keyin rasm o'chadi
  if (doc && doc.image) {
    await deleteFromCloud(doc.image).catch((err) =>
      console.log("Cloud delete failed", err),
    );
  }

  res.status(204).json({ status: "success", data: null });
});
