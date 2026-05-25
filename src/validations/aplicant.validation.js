const { z } = require("zod");

const phoneUz = /^\+998\d{9}$/;

const createApplicantSchema = z.object({
  body: z.object({
    fullname: z
      .string({ required_error: "Ism kiritilishi shart" })
      .trim()
      .min(5, "Ism-familiya kamida 5 ta harfdan iborat bo'lishi kerak")
      .max(50, "Ism-familiya 50 ta harfdan oshmasligi kerak"),
    phone: z
      .string({ required_error: "Telefon raqami kiritilishi shart" })
      .trim()
      .regex(
        phoneUz,
        "Telefon raqami noto'g'ri formatda (+998XXXXXXXXX bo'lishi kerak)",
      ),
    direction: z
      .string({ required_error: "Yo'nalishni tanlash shart" })
      .trim()
      .min(2, "Yo'nalish kiritilishi shart"),
  }),
});

const updateApplicantSchema = z.object({
  body: z.object({
    fullname: z.string().trim().min(5).max(50).optional(),
    phone: z.string().trim().regex(phoneUz).optional(),
    direction: z.string().trim().optional(),
    status: z
      .enum(["yangi", "bog'lanildi", "qabul", "rad"], {
        errorMap: () => ({
          message:
            "Status faqat: yangi, bog'lanildi, qabul yoki rad bo'lishi mumkin",
        }),
      })
      .optional(),
  }),
});

module.exports = { createApplicantSchema, updateApplicantSchema };
