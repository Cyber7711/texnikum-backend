"use strict";

const Applicant = require("../models/applicant");
const catchAsync = require("../middleware/catchAsync");
const sendResponse = require("../middleware/sendResponse");
const AppError = require("../utils/appError");

// Helper: normalize phone number (keep digits and leading +)
const normalizePhone = (phone = "") => {
  if (typeof phone !== "string") return "";
  const trimmed = phone.trim();
  // allow leading + then digits, otherwise just digits
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^0-9]/g, "");
  return hasPlus ? `+${digits}` : digits;
};

// Create a new applicant (protect against duplicates)
exports.createApplicant = catchAsync(async (req, res, next) => {
  const { phone, fullname, direction } = req.body || {};

  if (!fullname || !phone) {
    return next(
      new AppError("Ism va telefon raqami kiritilishi majburiy.", 400),
    );
  }

  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return next(new AppError("Noto'g'ri telefon raqami.", 400));

  const existingApplicant = await Applicant.findOne({ phone: cleanPhone });
  if (existingApplicant) {
    return next(
      new AppError(
        "Bu telefon raqami orqali allaqachon ariza yuborilgan.",
        400,
      ),
    );
  }

  const payload = {
    fullname: fullname.trim(),
    phone: cleanPhone,
    direction: direction ? String(direction).trim() : undefined,
    ip: req.ip,
    userAgent: req.get("User-Agent") || undefined,
  };

  const result = await Applicant.create(payload);

  sendResponse(res, {
    status: 201,
    message: "Arizangiz qabul qilindi.",
    data: result,
  });
});

// Get all applicants with basic pagination and optional search
exports.getAllApplicants = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const q = (req.query.q || "").trim();

  const filter = {};
  if (q) {
    // search by fullname or phone (partial match)
    filter.$or = [
      { fullname: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  const total = await Applicant.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;

  const items = await Applicant.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  sendResponse(res, {
    status: 200,
    data: { items, meta: { total, page, limit, totalPages } },
  });
});

// Get single applicant by ID
exports.getApplicantById = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) return next(new AppError("Ariza topilmadi.", 404));
  sendResponse(res, { status: 200, data: applicant });
});

// Delete applicant (admin)
exports.deleteApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findByIdAndDelete(req.params.id);
  if (!applicant)
    return next(new AppError("Bunday ID bilan ariza topilmadi.", 404));
  sendResponse(res, {
    status: 200,
    message: "Ariza o'chirildi.",
    data: applicant,
  });
});
