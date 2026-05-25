const { z } = require("zod");

const categories = ["nizom", "qaror", "buyruq", "metodik"];

const documentBodySchema = z.object({
  title: z
    .string({ required_error: "Sarlavha kiritilishi shart" })
    .trim()
    .min(1, "Sarlavha kiritilishi shart")
    .max(200, "Sarlavha 200 belgidan oshmasligi kerak"),

  category: z.enum(categories, {
    errorMap: () => ({ message: "Kategoriya noto'g'ri" }),
  }),

  // `file` is the storage path (Supabase). Required on create.
  file: z.string({ required_error: "Fayl kiritilishi shart" }).trim(),

  fileType: z.string().trim().optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

const createDocumentSchema = z.object({
  body: documentBodySchema,
});

const updateDocumentSchema = z.object({
  body: documentBodySchema.partial(),
});

module.exports = { createDocumentSchema, updateDocumentSchema };
