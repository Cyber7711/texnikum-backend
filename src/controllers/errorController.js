module.exports = (err, req, res, next) => {
  console.error("❌ Xato:", err.message);

  if (err.name === "ValidationError") {
    const formattedErrors = Object.keys(err.errors).map((field) => {
      const error = err.errors[field];
      return {
        field,
        message: error.message,
        value: error.value,
      };
    });

    return res.status(400).json({
      success: false,
      message: "Validatsiya xatolari aniqlandi",
      errors: formattedErrors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Noto‘g‘ri ID formati: ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    return res.status(400).json({
      success: false,
      message: `Bu ${field} (${value}) allaqachon mavjud.`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Serverda kutilmagan xato yuz berdi";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (err.statusCode === 500) {
    logger.error("CRETICAL_SERVER_ERROR", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  res.status(err.statusCode).json({
    status: "fail",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
