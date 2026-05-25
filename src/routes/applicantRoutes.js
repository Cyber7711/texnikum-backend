const express = require("express");
const applicantController = require("../controllers/applicantController");

// Himoya va Validatsiya vositalari
const { protect } = require("../middleware/protect");
const validate = require("../middleware/validate");
const {
  createApplicantSchema,
  updateApplicantSchema,
} = require("../validations/aplicant.validation");

const router = express.Router();

// 🌐 Ochiq yo'lak (Abituriyentlar ariza topshirishi uchun)
router.post(
  "/",
  validate(createApplicantSchema), // Ma'lumotlarni qat'iy tekshiramiz!
  applicantController.createApplicant,
);

// 🔒 Yopiq yo'laklar (Faqat Adminlar uchun)
router.use(protect); // Pastdagi barcha marshrutlar uchun token talab qilinadi

router.get("/", applicantController.getAllApplicants);
// router.get("/:id", applicantController.getAllApplicants);

// router.patch(
//   "/:id",
//   validate(updateApplicantSchema), // Admin xato status kiritmasligi uchun tekshiramiz
//   applicantController.updateApplicant,
// );

router.delete("/:id", applicantController.deleteApplicant);

module.exports = router;
