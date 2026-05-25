// utils/upload.js
const supabase = require("../config/supabase");

const sanitizeFileName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const uploadToCloud = async (file) => {
  try {
    const originalName = file.originalname || "unnamed_file";
    const safeName = sanitizeFileName(originalName);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const filePath = `${uniqueSuffix}-${safeName}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Supabase API Xatosi:", error.message);
      throw new Error("Supabase API xatosi");
    }

    return data.path;
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error("Faylni bulutga yuklashda kutilmagan xatolik yuz berdi");
  }
};

module.exports = uploadToCloud;
