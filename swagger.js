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
          required: ["title", "value"], // modeldagi required maydonlar
          properties: {
            title: {
              type: "string",
              description: "Statistika sarlavhasi",
              example: "Matematika fan bo‘yicha testlar soni",
            },
            value: {
              type: "integer",
              description: "Statistika qiymati",
              example: 25,
            },
            isActive: {
              type: "boolean",
              description: "Faol yoki yo‘q",
              example: true,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        News: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: {
              type: "string",
              description: "Yangilik sarlavhasi",
              example: "Yangi loyiha ishga tushdi",
            },
            content: {
              type: "string",
              description: "Yangilik matni",
              example: "Bugun kompaniyamiz yangi platformani ishga tushirdi...",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Yangilik sanasi",
              example: "2025-11-05T12:00:00Z",
            },
            author: {
              type: "string",
              description: "Muallif ismi",
              example: "Admin",
            },
            image: {
              type: "string",
              description: "Yangilik rasmi manzili",
              example: "uploads/news1.jpg",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // route fayllarni skan qiladi
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
