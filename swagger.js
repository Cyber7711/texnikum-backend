const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API Docs",
      version: "1.0.0",
      description: "Umumiy API hujjatlari",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Teacher: {
          type: "object",
          required: ["name", "subject", "email"],
          properties: {
            name: { type: "string", example: "Ali Valiyev" },
            subject: { type: "string", example: "Mathematics" },
            email: { type: "string", example: "ali@example.com" },
            phone: { type: "string", example: "+998901234567" },
          },
        },
        Stats: {
          type: "object",
          required: ["title", "value"],
          properties: {
            title: { type: "string", example: "Matematika testlar soni" },
            value: { type: "integer", example: 25 },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        News: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: { type: "string", example: "Yangi loyiha ishga tushdi" },
            content: { type: "string", example: "Bugun kompaniya..." },
            date: { type: "string", format: "date-time" },
            author: { type: "string", example: "Admin" },
            image: { type: "string", example: "uploads/news1.jpg" },
          },
        },
        Event: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Tech Conference 2025" },
            date: { type: "string", format: "date-time" },
            description: { type: "string", example: "Yangi texnologiyalar..." },
          },
        },
        Department: {
          type: "object",
          required: ["name", "desc", "duration"],
          properties: {
            name: { type: "string", example: "Kompyuter injiniringi" },
            desc: { type: "string", example: "Dasturlash va tizim tahlili" },
            duration: { type: "integer", example: 4 },
            teachers: { type: "array", items: { type: "string" } },
            courses: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Docs: {
          type: "object",
          required: ["title", "file"],
          properties: {
            title: { type: "string", example: "O‘quv dasturi 2025" },
            file: { type: "string", example: "program2025.pdf" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Announcement: {
          type: "object",
          required: ["title", "description"],
          properties: {
            title: { type: "string", example: "Yangi kurs boshlanishi" },
            description: { type: "string", example: "Informatika kursi..." },
            date: { type: "string", format: "date-time" },
            expireDate: { type: "string", format: "date-time" },
            createdBy: { type: "string", example: "Admin" },
            isActive: { type: "boolean", example: true },
            role: { type: "string", enum: ["admin"], example: "admin" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }], // global security, barcha route’lar uchun token talab qilinadi
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
