const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const applicantRoutes = require("./applicantRoutes");
const teacherRoutes = require("./teachersRoutes");
const newsRoutes = require("./newsRoutes");
const docRoutes = require("./docRoutes");
const statisticsRoutes = require("./statisticsRoutes");
const quicklinksRoutes = require("./quicklinksRoutes");
const managementRoutes = require("./managementRoutes");

router.use("/auth", authRoutes);
router.use("/applicant", applicantRoutes);
router.use("/teachers", teacherRoutes);
router.use("/news", newsRoutes);
router.use("/doc", docRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/quicklinks", quicklinksRoutes);
router.use("/management", managementRoutes);

module.exports = router;
