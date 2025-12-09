const mongoose = require("mongoose");

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Noto‘g‘ri ID formati", 400);
  }
};

module.exports = validateId;
