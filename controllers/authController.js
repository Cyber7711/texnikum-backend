"use strict";

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");

// ==============================
// Helpers
// ==============================
const getEnvNumber = (key, fallback) => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
};

const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
};

const getCookieOptions = (req) => {
  const days = getEnvNumber("JWT_COOKIE_EXPIRES_IN_DAYS", 30);
  const crossSite = process.env.COOKIE_CROSS_SITE === "true";

  const sameSite = crossSite ? "none" : "lax";
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  const secure = crossSite ? true : isHttps;

  return {
    httpOnly: true,
    secure,
    sameSite,
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
  const opts = { ...getCookieOptions(req), expires: new Date(0) };
  res.cookie("access_token", "", opts);
  res.cookie("refresh_token", "", opts);
};

const signAccessToken = (admin) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is missing");
  return jwt.sign({ id: admin._id }, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const signRefreshToken = (admin) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is missing");
  return jwt.sign({ id: admin._id, jti: uuid() }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

const sendUser = (res, admin) => {
  const safe = admin.toObject ? admin.toObject() : { ...admin };
  delete safe.password;
  delete safe.refreshTokens;
  delete safe.loginAttempts;
  delete safe.lockUntil;

  return res.status(200).json({
    status: "success",
    data: { user: safe },
  });
};

// ==============================
// reCAPTCHA v3
// ==============================
const verifyRecaptchaV3 = async ({ token, expectedAction }) => {
  if (!token) return { ok: false, reason: "missing_token" };

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, reason: "missing_secret" };

  const url =
    "https://www.google.com/recaptcha/api/siteverify" +
    `?secret=${encodeURIComponent(secret)}` +
    `&response=${encodeURIComponent(token)}`;

  const { data } = await axios.post(url);

  if (!data?.success)
    return { ok: false, reason: "verify_failed", details: data };

  if (expectedAction && data.action && data.action !== expectedAction) {
    return { ok: false, reason: "action_mismatch", details: data };
  }

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
// Core token issuing
// ==============================
const issueTokensForAdmin = async (req, res, admin) => {
  const accessToken = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);

  const refreshHash = admin.hashToken(refreshToken);
  admin.refreshTokens.push(refreshHash);

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

    // reCAPTCHA (prod’da ON)
    const captchaDisabled = process.env.CAPTCHA_DISABLED === "true";
    if (!captchaDisabled) {
      const result = await verifyRecaptchaV3({
        token: captchaToken,
        expectedAction: process.env.RECAPTCHA_ACTION || "login",
      });

      if (!result.ok) {
        // Prod’da ham minimal debug (secret chiqmaydi)
        console.log("recaptcha_fail:", {
          reason: result.reason,
          details: result.details
            ? {
                success: result.details.success,
                score: result.details.score,
                action: result.details.action,
                hostname: result.details.hostname,
                errorCodes: result.details["error-codes"],
              }
            : null,
        });

        return next(
          new AppError("Xavfsizlik tizimi sizni bot deb topdi 🤖", 403),
        );
      }
    }

    const admin = await Admin.findOne({ username }).select(
      "+password +loginAttempts +lockUntil +refreshTokens",
    );

    if (!admin) {
      return next(new AppError("Login yoki parol noto'g'ri", 401));
    }

    // Lockout
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

    // Success -> reset
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
    } catch {
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

    if (admin.changedPasswordAfter(decoded.iat)) {
      admin.refreshTokens = [];
      await admin.save({ validateBeforeSave: false });
      clearAuthCookies(req, res);
      return next(new AppError("Parol o‘zgargan. Qayta login qiling.", 401));
    }

    const incomingHash = admin.hashToken(refreshToken);
    const exists = admin.refreshTokens.includes(incomingHash);

    if (!exists) {
      // token reuse / stolen token -> kill sessions
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

    // Rotate
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

// Protect middleware
exports.protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token;
    if (!accessToken)
      return next(new AppError("Iltimos, avval tizimga kiring.", 401));

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        accessToken,
        process.env.JWT_ACCESS_SECRET,
      );
    } catch {
      return next(new AppError("Sessiya tugagan. Qayta urining.", 401));
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin)
      return next(new AppError("Bu token egasi endi mavjud emas.", 401));

    if (admin.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Parol o'zgargan! Qaytadan kiring.", 401));
    }

    req.user = admin;
    return next();
  } catch {
    return next(new AppError("Noto‘g‘ri token yoki sessiya tugagan.", 401));
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  return sendUser(res, req.user);
};
