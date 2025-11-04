const findById = (Model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await Model.findById(id);
      if (!item) {
        return res.status(404).json({ message: "malumot topilmadi" });
      }
      req.item = item;
      next();
    } catch (err) {
      res.status(500).json({ message: "Xatolik", details: err.message });
    }
  };
};

module.exports = findById;
