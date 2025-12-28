// utils/uploadToCloud.js
const { uploadFile } = require("@uploadcare/upload-client");

const uploadToCloud = async (file) => {
  if (!file || !file.buffer) return null;

  try {
    const result = await uploadFile(file.buffer, {
      publicKey: "cfdd5a9996f2d83995d9",
      store: true, // doimiy saqlash
    });

    // ❗ Faqat UUID
    return result.uuid;
  } catch (error) {
    console.error("❌ Uploadcare yuklashda xato:", error);
    throw error;
  }
};

module.exports = uploadToCloud;
