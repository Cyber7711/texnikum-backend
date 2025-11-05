const express = require("express");
const router = express.Router();
const findById = require("../middleware/findById");
const docController = require("../controllers/docController");
const Docs = require("../models/documents");
const { protect, restrictTo } = require("../middleware/protect");

router.post("/", protect, docController.createDoc);
router.get("/", docController.getAllDocs);
router.get("/:id", findById(Docs), docController.getDocById);
router.put("/:id", protect, findById(Docs), docController.updateDoc);
router.delete("/:id", protect, findById(Docs), docController.deleteDoc);

module.exports = router;
