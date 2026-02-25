// utils/deleteFile.js
const supabase = require("../config/supabase");

const deleteFromCloud = async (filePath) => {
  if (!filePath || filePath.trim() === "") return;

  try {
    const { data, error } = await supabase.storage
      .from("uploads")
      .remove([filePath]);

    if (error) {
      console.error("Supabase API o'chirish xatosi:", error.message);
      return;
    }

    console.log(`✅ Supabase fayl muvaffaqiyatli o'chirildi: ${filePath}`);
  } catch (error) {
    console.error("❌ Supabase o'chirish tizimidagi xatolik:", error.message);
  }
};

module.exports = deleteFromCloud;
