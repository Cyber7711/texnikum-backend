const { uploadFile } = require("@uploadcare/upload-client");

const uploadToCloud = async (file) => {
  if (!file || !file.buffer) return null;

  try {
    // Muhim: Buffer-ni Uploadcare tushunadigan formatga tekshirish
    const result = await uploadFile(file.buffer, {
      publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
      store: "auto", // 'auto' yoki '1'
      fileName: file.originalname,
      contentType: file.mimetype,
    });

    console.log("🚀 Yuklangan fayl UUID:", result.uuid);
    return result.uuid;
  } catch (error) {
    console.error("❌ Uploadcare xatosi:", error);
    throw new Error("Rasmni bulutga yuklashda xatolik yuz berdi");
  }
};

module.exports = uploadToCloud;
