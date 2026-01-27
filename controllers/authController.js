const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");

// 1. TOKEN YARATISH VA COOKIE YUBORISH FUNKSIYASI
const signToken = (id) => {
  return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Cookie sozlamalari (Eng xavfsiz holatda)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // 🛡️ JS o'qiyolmaydi (XSS himoya)
    secure: req.secure || req.headers["x-forwarded-proto"] === "https", // 🛡️ Faqat HTTPS (Productionda)
    sameSite: "strict", // 🛡️ CSRF himoya
  };

  res.cookie("jwt", token, cookieOptions);

  // Parolni javobdan olib tashlaymiz
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// 2. LOGIN (ASOSIY MANTIQ)
exports.login = async (req, res, next) => {
  try {
    const { username, password, captchaToken } = req.body;

    // --- STEP 1: RECAPTCHA CHECK (BOTLARNI TO'XTATAMIZ) ---
    if (!captchaToken) {
      return next(new AppError("Xavfsizlik (reCAPTCHA) tokeni yo'q!", 400));
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const recaptchaRes = await axios.post(verifyUrl);
    const { success, score } = recaptchaRes.data;

    // Google v3 score (0.0 - 1.0). 0.5 dan past = Bot
    if (!success || score < 0.5) {
      return next(
        new AppError("Xavfsizlik tizimi sizni bot deb topdi 🤖", 403),
      );
    }

    // --- STEP 2: MA'LUMOTLARNI TEKSHIRISH ---
    if (!username || !password) {
      return next(new AppError("Login va parol kiritilishi shart!", 400));
    }

    // --- STEP 3: FOYDALANUVCHINI TOPISH (+password kerak) ---
    const admin = await Admin.findOne({ username }).select(
      "+password +loginAttempts +lockUntil",
    );

    // Hakerga "Bunday user yo'q" deb aytmaymiz! Umumiy xato beramiz.
    if (!admin) {
      return next(new AppError("Login yoki parol noto'g'ri", 401));
    }

    // --- STEP 4: ACCOUNT LOCKOUT (BLOKLASH TIZIMI) ---
    // Agar hisob bloklangan bo'lsa va vaqti hali tugamagan bo'lsa
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      const waitTime = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return next(
        new AppError(
          `Hisob bloklangan! ${waitTime} daqiqadan so'ng urining.`,
          429,
        ),
      );
    }

    // Agar vaqt o'tgan bo'lsa, blokni olib tashlaymiz
    if (admin.lockUntil && admin.lockUntil < Date.now()) {
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
    }

    // --- STEP 5: PAROLNI TEKSHIRISH ---
    const isMatch = await admin.correctPassword(password, admin.password);

    if (!isMatch) {
      // Xato urinishlarni sanaymiz
      admin.loginAttempts += 1;

      // Agar 5 marta xato qilsa -> 1 soatga bloklaymiz
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 60 * 60 * 1000; // 1 soat
        await admin.save();
        return next(
          new AppError(
            "Juda ko'p xato urinish! Hisob 1 soatga bloklandi.",
            429,
          ),
        );
      }

      await admin.save();
      return next(new AppError("Login yoki parol noto'g'ri", 401));
    }

    // --- STEP 6: MUVAFFAQIYATLI KIRISH ---
    // Urinishlarni nollaymiz
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    createSendToken(admin, 200, req, res);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    next(err);
  }
};

// 3. LOGOUT (COOKIE TOZALASH)
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // 10 soniyada o'chadi
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

// 4. PROTECT (FAQAT LOGGED IN USERLAR UCHUN)
exports.protect = async (req, res, next) => {
  try {
    let token;
    // 1. Tokenni Header yoki Cookie dan olish
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError("Iltimos, avval tizimga kiring.", 401));
    }

    // 2. Tokenni tekshirish
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. User hali ham mavjudmi?
    const currentUser = await Admin.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("Bu token egasi endi mavjud emas.", 401));
    }

    // 4. Parol o'zgargan bo'lsa token kuyadi
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Parol o'zgargan! Qaytadan kiring.", 401));
    }

    // Userni requestga biriktiramiz
    req.user = currentUser;
    next();
  } catch (err) {
    next(new AppError("Noto'g'ri token yoki sessiya tugagan.", 401));
  }
};
