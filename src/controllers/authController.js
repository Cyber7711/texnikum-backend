"use strict";

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");

// ==============================
// 1. YORDAMCHI FUNKSIYALAR (Helpers)
// ==============================
const getEnvNumber = (key, fallback) => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
};

const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString("hex");

// HTTP-Only, Secure, SameSite Cookie sozlamalari
const getCookieOptions = (req) => {
  const days = getEnvNumber("JWT_COOKIE_EXPIRES_IN_DAYS", 30);
  const crossSite = process.env.COOKIE_CROSS_SITE === "true"; // Agar front va back boshqa domen bo'lsa "true" bo'ladi

  return {
    httpOnly: true, // XSS hujumlaridan himoya (Frontend JS o'qiy olmaydi)
    secure: crossSite
      ? true
      : req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: crossSite ? "none" : "lax", // CSRF himoyasi
    path: "/",
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  };
};

const setAuthCookies = (req, res, { accessToken, refreshToken }) => {
  const opts = getCookieOptions(req);
  res.cookie("access_token", accessToken, opts);
  res.cookie("refresh_token", refreshToken, opts);
};

const clearAuthCookies = (req, res) => {
  const opts = { ...getCookieOptions(req), expires: new Date(0) }; // Cookieni o'chirish
  res.cookie("access_token", "loggedout", opts);
  res.cookie("refresh_token", "loggedout", opts);
};

const signAccessToken = (admin) =>
  jwt.sign({ id: admin._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
const signRefreshToken = (admin) =>
  jwt.sign({ id: admin._id, jti: uuid() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

const sendUser = (res, admin) => {
  const safeAdmin = admin.toObject ? admin.toObject() : { ...admin };
  // Maxfiy ma'lumotlarni front-endga yubormaymiz
  delete safeAdmin.password;
  delete safeAdmin.refreshTokens;
  delete safeAdmin.loginAttempts;
  delete safeAdmin.lockUntil;

  return res.status(200).json({ status: "success", data: { user: safeAdmin } });
};

// ==============================
// 2. RECAPTCHA TEKSHIRUVI
// ==============================
const verifyRecaptchaV3 = async ({ token, expectedAction }) => {
  if (!token) return { ok: false, reason: "missing_token" };
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, reason: "missing_secret" };

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;
  const { data } = await axios.post(url);

  if (!data?.success) return { ok: false, reason: "verify_failed" };
  if (expectedAction && data.action && data.action !== expectedAction)
    return { ok: false, reason: "action_mismatch" };
  if (
    typeof data.score === "number" &&
    data.score < getEnvNumber("RECAPTCHA_MIN_SCORE", 0.4)
  )
    return { ok: false, reason: "low_score" };

  return { ok: true, details: data };
};

// ==============================
// 3. ASOSIY KONTROLLERLAR
// ==============================

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { username, password, captchaToken } = req.body;
    if (!username || !password)
      return next(new AppError("Login va parol kiritilishi shart!", 400));

    // Bot tekshiruvi
    if (process.env.CAPTCHA_DISABLED !== "true") {
      const result = await verifyRecaptchaV3({
        token: captchaToken,
        expectedAction: "login",
      });
      if (!result.ok)
        return next(
          new AppError("Xavfsizlik tizimi sizni shubhali deb topdi 🤖", 403),
        );
    }

    const admin = await Admin.findOne({ username }).select(
      "+password +loginAttempts +lockUntil +refreshTokens",
    );
    if (!admin) return next(new AppError("Login yoki parol noto'g'ri", 401));

    // Hisob bloklanganligini tekshirish
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return next(
        new AppError(
          `Xavfsizlik tizimi: Hisobingiz bloklangan! ${waitMinutes} daqiqadan so'ng urining.`,
          429,
        ),
      );
    }

    // Parol tekshirish
    const isCorrect = await admin.correctPassword(password, admin.password);
    if (!isCorrect) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= getEnvNumber("MAX_LOGIN_ATTEMPTS", 5)) {
        admin.lockUntil = Date.now() + getEnvNumber("LOCK_MS", 60 * 60 * 1000); // 1 soat blok
        await admin.save({ validateBeforeSave: false });
        return next(
          new AppError(
            "Juda ko'p xato urinish! Hisobingiz vaqtincha bloklandi.",
            429,
          ),
        );
      }
      await admin.save({ validateBeforeSave: false });
      return next(new AppError("Login yoki parol noto'g'ri", 401));
    }

    // Login muvaffaqiyatli
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;

    const accessToken = signAccessToken(admin);
    const refreshToken = signRefreshToken(admin);
    const refreshHash = admin.hashToken(refreshToken);

    admin.refreshTokens.push(refreshHash);
    if (admin.refreshTokens.length > getEnvNumber("MAX_SESSIONS", 5)) {
      admin.refreshTokens = admin.refreshTokens.slice(
        -getEnvNumber("MAX_SESSIONS", 5),
      );
    }

    await admin.save({ validateBeforeSave: false });
    setAuthCookies(req, res, { accessToken, refreshToken });
    return sendUser(res, admin);
  } catch (err) {
    return next(err);
  }
};

// REFRESH TOKEN (Sessiyani uzaytirish)
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      return next(new AppError("Sessiya tugagan. Tizimga qayta kiring.", 401));

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );
    } catch {
      clearAuthCookies(req, res);
      return next(new AppError("Sessiya yaroqsiz. Tizimga qayta kiring.", 401));
    }

    const admin = await Admin.findById(decoded.id).select("+refreshTokens");
    if (!admin) {
      clearAuthCookies(req, res);
      return next(new AppError("Foydalanuvchi topilmadi.", 401));
    }

    const incomingHash = admin.hashToken(refreshToken);
    if (!admin.refreshTokens.includes(incomingHash)) {
      admin.refreshTokens = []; // Hacker hujumi! Barcha sessiyalarni o'chiramiz.
      await admin.save({ validateBeforeSave: false });
      clearAuthCookies(req, res);
      return next(
        new AppError(
          "Xavfsizlik xatari! Hisobingizdan barcha sessiyalar o'chirildi.",
          401,
        ),
      );
    }

    // Yangi tokenlar yaratish
    admin.refreshTokens = admin.refreshTokens.filter((h) => h !== incomingHash);
    const newAccessToken = signAccessToken(admin);
    const newRefreshToken = signRefreshToken(admin);

    admin.refreshTokens.push(admin.hashToken(newRefreshToken));
    await admin.save({ validateBeforeSave: false });

    setAuthCookies(req, res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    return res.status(200).json({ status: "success" });
  } catch (err) {
    return next(err);
  }
};

// LOGOUT
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.id) {
        const admin = await Admin.findById(decoded.id).select("+refreshTokens");
        if (admin) {
          admin.refreshTokens = admin.refreshTokens.filter(
            (h) => h !== admin.hashToken(refreshToken),
          );
          await admin.save({ validateBeforeSave: false });
        }
      }
    }
    clearAuthCookies(req, res);
    return res
      .status(200)
      .json({ status: "success", message: "Tizimdan muvaffaqiyatli chiqildi" });
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/me (Hozirgi foydalanuvchini olish)
exports.me = async (req, res) => {
  return sendUser(res, req.user);
};
