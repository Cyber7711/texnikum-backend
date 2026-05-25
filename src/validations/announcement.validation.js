const { z } = require("zod");

const textRegex = /^[a-zA-Z0-9\s.,!?()'\-]+$/;

const announcementBodySchema = z.object({
	title: z
		.string({ required_error: "Sarlavha kiritilishi shart" })
		.trim()
		.min(3, "Sarlavha kamida 3 belgidan iborat bo‘lishi kerak")
		.max(100, "Sarlavha 100 belgidan oshmasligi kerak")
		.regex(textRegex, "Sarlavhada faqat harf, raqam va oddiy belgilar bo‘lishi mumkin"),

	description: z
		.string({ required_error: "Tavsif kiritilishi shart" })
		.trim()
		.min(10, "Tavsif kamida 10 belgidan iborat bo‘lishi kerak")
		.regex(textRegex, "Tavsifda faqat harf, raqam va oddiy belgilar bo‘lishi mumkin"),

	expireDate: z
		.coerce
		.date({ invalid_type_error: "Noto'g'ri expire sanasi" })
		.optional(),
});

const createAnnouncementSchema = z.object({
	body: announcementBodySchema.refine(
		(data) => {
			if (data.expireDate) {
				return data.expireDate > new Date();
			}
			return true;
		},
		{ message: "Expire sanasi hozirgi sanadan keyin bo'lishi kerak", path: ["expireDate"] },
	),
});

const updateAnnouncementSchema = z.object({
	body: announcementBodySchema.partial().refine(
		(data) => {
			if (data.expireDate) {
				return data.expireDate > new Date();
			}
			return true;
		},
		{ message: "Expire sanasi hozirgi sanadan keyin bo'lishi kerak", path: ["expireDate"] },
	),
});

module.exports = { createAnnouncementSchema, updateAnnouncementSchema };
