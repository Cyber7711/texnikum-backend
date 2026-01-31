"use strict";

const crypto = require("crypto");
const AppError = require("../utils/appError");

const getCookieOptions = (req) => {
  const crossSite = process.env.COOKIE_CROSS_SITE === "true";
  const sameSite = crossSite ? "none" : "lax";

  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  const secure = crossSite ? true : isHttps;

  return {
    secure,
    sameSite,
    path: "/",
  };
};

// ✅ 1) CSRF token berish endpointi
exports.csrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie("csrf_token", token, {
    ...getCookieOptions(req),
    httpOnly: false, // front o‘qiy oladi
    maxAge: 2 * 60 * 60 * 1000, // 2 soat
  });

  return res.status(200).json({ status: "success" });
};

// ✅ 2) CSRF protect middleware (POST/PUT/PATCH/DELETE)
exports.csrfProtect = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return next();

  // Login/refresh/logout ni CSRF'dan ozod qilamiz (xohlasang keyin qo‘shamiz)
  const url = req.originalUrl || "";
  const isAuth =
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/refresh-token") ||
    url.includes("/api/auth/logout") ||
    url.includes("/api/auth/csrf");

  if (isAuth) return next();

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError("CSRF tekshiruvdan o‘tmadi.", 403));
  }

  return next();
};
