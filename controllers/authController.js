// controllers/authController.js
"use strict";

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");

// ==============================
// Config helpers
// ==============================
const isProd = () => process.env.NODE_ENV === "production";

const getEnvNumber = (key, fallback) => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
};

const getCookieOptions = (req) => {
  // Cookie necha kun saqlanishi (refresh token muddati bilan mos bo‘lsin)
  const days = getEnvNumber("JWT_COOKIE_EXPIRES_IN_DAYS", 30);

  // Render + Vercel => cross-site cookie kerak bo‘ladi
  const crossSite = process.env.COOKIE_CROSS_SITE === "true";

  // SameSite=None bo‘lsa Secure majburiy
  const sameSite = crossSite ? "none" : "lax";

  // reverse proxy (Render) ortida HTTPS aniqlash
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";

  // cross-site bo‘lsa secure true bo‘lishi shart
  const secure = crossSite ? true : isHttps;

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  };
};

// ==============================
// Token helpers
// ==============================
const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
};

const signAccessToken = (admin) => {
  return jwt.sign({ id: admin._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const signRefreshToken = (admin) => {
  return jwt.sign(
    { id: admin._id, jti: uuid() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" },
  );
};

const setAuthCookies = (req, res, { accessToken, refreshToken }) => {
  const opts = getCookieOptions(req);
  res.cookie("access_token", accessToken, opts);
  res.cookie("refresh_token", refreshToken, opts);
};

const clearAuthCookies = (req, res) => {
  const opts = { ...getCookieOptions(req), expires: new Date(0) };
  res.cookie("access_token", "", opts);
  res.cookie("refresh_token", "", opts);
};

const sendUser = (res, admin) => {
  const safe = admin.toObject ? admin.toObject() : { ...admin };
  delete safe.password;
  delete safe.refreshTokens;
  delete safe.loginAttempts;
  delete safe.lockUntil;

  res.status(200).json({
    status: "success",
    data: { user: safe },
  });
};

// ==============================
// reCAPTCHA v3 verification
// ==============================
const verifyRecaptchaV3 = async ({ token, expectedAction }) => {
  if (!token) {
    return { ok: false, reason: "missing_token" };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    // prod’da bu katta muammo; dev’da esa ixtiyoriy bypass qilinishi mumkin
    return { ok: false, reason: "missing_secret" };
  }

  const url =
    "https://www.google.com/recaptcha/api/siteverify" +
    `?secret=${encodeURIComponent(secret)}` +
    `&response=${encodeURIComponent(token)}`;

  // axios.post(verifyUrl) bilan ham bo‘ladi, lekin urlencoded query ham OK
  const { data } = await axios.post(url);

  // data: { success, score, action, hostname, "error-codes": [] }
  if (!data?.success) {
    return { ok: false, reason: "verify_failed", details: data };
  }

  // Action check (recommended)
  if (expectedAction && data.action && data.action !== expectedAction) {
    return { ok: false, reason: "action_mismatch", details: data };
  }

  // Hostname check (optional, prod’da yaxshi)
  const allowedHosts = (process.env.RECAPTCHA_ALLOWED_HOSTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (
    allowedHosts.length &&
    data.hostname &&
    !allowedHosts.includes(data.hostname)
  ) {
    return { ok: false, reason: "hostname_blocked", details: data };
  }

  const minScore = getEnvNumber("RECAPTCHA_MIN_SCORE", 0.3);
  if (typeof data.score === "number" && data.score < minScore) {
    return { ok: false, reason: "low_score", details: data };
  }

  return { ok: true, details: data };
};

// ==============================
// Core: Issue + store refresh hash
// ==============================
const issueTokensForAdmin = async (req, res, admin) => {
  const accessToken = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);

  const refreshHash = admin.hashToken(refreshToken);

  // Rotation list
  admin.refreshTokens.push(refreshHash);

  // Optional session cap
  const maxSessions = getEnvNumber("MAX_SESSIONS", 5);
  if (admin.refreshTokens.length > maxSessions) {
    admin.refreshTokens = admin.refreshTokens.slice(-maxSessions);
  }

  await admin.save({ validateBeforeSave: false });

  setAuthCookies(req, res, { accessToken, refreshToken });
};

// ==============================
// Controllers
// ==============================

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password, captchaToken } = req.body;

    if (!username || !password) {
      return next(new AppError("Login va parol kiritilishi shart!", 400));
    }

    // reCAPTCHA optional bypass for dev
    const captchaDisabled = process.env.CAPTCHA_DISABLED === "true";
    if (!captchaDisabled) {
      const result = await verifyRecaptchaV3({
        token: captchaToken,
        expectedAction: process.env.RECAPTCHA_ACTION || "login",
      });

      if (!result.ok) {
        // Debug uchun (prod’da loglarni ehtiyot qil)
        if (!isProd()) console.log("recaptcha:", result);

        return next(
          new AppError("Xavfsizlik tizimi sizni bot deb topdi 🤖", 403),
        );
      }
    }

    const admin = await Admin.findOne({ username }).select(
      "+password +loginAttempts +lockUntil +refreshTokens",
    );

    // Enumeration yo‘q: bitta umumiy error
    if (!admin) {
      return next(new AppError("Login yoki parol noto'g'ri", 401));
    }

    // Lockout check
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return next(
        new AppError(
          `Hisob bloklangan! ${waitMinutes} daqiqadan so'ng urining.`,
          429,
        ),
      );
    }

    // Expired lock reset
    if (admin.lockUntil && admin.lockUntil < Date.now()) {
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save({ validateBeforeSave: false });
    }

    const ok = await admin.correctPassword(password, admin.password);
    if (!ok) {
      admin.loginAttempts += 1;

      const maxAttempts = getEnvNumber("MAX_LOGIN_ATTEMPTS", 5);
      if (admin.loginAttempts >= maxAttempts) {
        const lockMs = getEnvNumber("LOCK_MS", 60 * 60 * 1000);
        admin.lockUntil = Date.now() + lockMs;
        await admin.save({ validateBeforeSave: false });

        return next(
          new AppError(
            "Juda ko'p xato urinish! Hisob vaqtincha bloklandi.",
            429,
          ),
        );
      }

      await admin.save({ validateBeforeSave: false });
      return next(new AppError("Login yoki parol noto'g'ri", 401));
    }

    // Success: reset counters
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save({ validateBeforeSave: false });

    await issueTokensForAdmin(req, res, admin);
    return sendUser(res, admin);
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return next(
        new AppError("Refresh token topilmadi. Qayta login qiling.", 401),
      );
    }

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );
    } catch (e) {
      clearAuthCookies(req, res);
      return next(
        new AppError("Refresh token noto‘g‘ri yoki muddati tugagan.", 401),
      );
    }

    const admin = await Admin.findById(decoded.id).select("+refreshTokens");
    if (!admin) {
      clearAuthCookies(req, res);
      return next(new AppError("Sessiya tugagan. Qayta login qiling.", 401));
    }

    // Password changed -> kill all sessions
    if (admin.changedPasswordAfter(decoded.iat)) {
      admin.refreshTokens = [];
      await admin.save({ validateBeforeSave: false });
      clearAuthCookies(req, res);
      return next(new AppError("Parol o‘zgargan. Qayta login qiling.", 401));
    }

    const incomingHash = admin.hashToken(refreshToken);

    // Reuse detection: token DB’da yo‘q
    const exists = admin.refreshTokens.includes(incomingHash);
    if (!exists) {
      admin.refreshTokens = [];
      await admin.save({ validateBeforeSave: false });
      clearAuthCookies(req, res);
      return next(
        new AppError(
          "Sessiya xavfsizlik sabab yopildi. Qayta login qiling.",
          401,
        ),
      );
    }

    // Rotation: remove old hash
    admin.refreshTokens = admin.refreshTokens.filter((h) => h !== incomingHash);

    const newAccessToken = signAccessToken(admin);
    const newRefreshToken = signRefreshToken(admin);
    const newHash = admin.hashToken(newRefreshToken);

    admin.refreshTokens.push(newHash);

    const maxSessions = getEnvNumber("MAX_SESSIONS", 5);
    if (admin.refreshTokens.length > maxSessions) {
      admin.refreshTokens = admin.refreshTokens.slice(-maxSessions);
    }

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

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.id) {
        const admin = await Admin.findById(decoded.id).select("+refreshTokens");
        if (admin) {
          const hash = admin.hashToken(refreshToken);
          admin.refreshTokens = admin.refreshTokens.filter((h) => h !== hash);
          await admin.save({ validateBeforeSave: false });
        }
      }
    }

    clearAuthCookies(req, res);
    return res.status(200).json({ status: "success" });
  } catch (err) {
    return next(err);
  }
};

// Middleware: protect admin routes (cookie-only)
exports.protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
      return next(new AppError("Iltimos, avval tizimga kiring.", 401));
    }

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        accessToken,
        process.env.JWT_ACCESS_SECRET,
      );
    } catch (e) {
      return next(new AppError("Sessiya tugagan. Qayta urining.", 401));
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(new AppError("Bu token egasi endi mavjud emas.", 401));
    }

    if (admin.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Parol o'zgargan! Qaytadan kiring.", 401));
    }

    req.user = admin;
    return next();
  } catch (err) {
    return next(new AppError("Noto‘g‘ri token yoki sessiya tugagan.", 401));
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  return sendUser(res, req.user);
};
