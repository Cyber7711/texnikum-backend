// src/middleware/xss.js
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

/**
 * XSS hujumlariga qarshi ma'lumotlarni tozalash (Sanitize)
 */
const xssCleaner = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") return DOMPurify.sanitize(obj);
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

module.exports = xssCleaner;
