const axios = require("axios");

const deleteFromCloud = async (uuid) => {
  // 1. UUID mavjudligini tekshirish
  if (!uuid) return false;

  // 2. UUID ni to'g'ri ajratib olish (Parsing)
  // Bu logika stringdan faqat UUID qismini qidirib topadi (URL bo'lsa ham, oddiy ID bo'lsa ham ishlaydi)
  let cleanUuid = uuid.toString();

  // Agar to'liq URL bo'lsa, uni bo'laklarga bo'lib, UUID ga o'xshash qismini olamiz
  if (cleanUuid.includes("/")) {
    const parts = cleanUuid.split("/");
    // UUID odatda 36 ta belgidan iborat bo'ladi, biz uzunroq qismini qidiramiz
    cleanUuid = parts.find((p) => p.length > 30) || cleanUuid;
  }

  // Ortiqcha belgilarni tozalash
  cleanUuid = cleanUuid.trim();

  try {
    // 3. API so'rovi
    await axios.delete(`https://api.uploadcare.com/files/${cleanUuid}/`, {
      headers: {
        // ⚠️ MUHIM O'ZGARISH: "Uploadcare.Account" -> "Uploadcare.Simple"
        Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    });

    console.log(`✅ Uploadcare fayl o‘chirildi: ${cleanUuid}`);
    return true; // Muvaffaqiyatli o'chdi
  } catch (error) {
    // 404 xatosi fayl allaqachon o'chirilganini bildiradi
    if (error.response?.status === 404) {
      console.warn(`⚠️ Fayl topilmadi (allaqachon o'chirilgan): ${cleanUuid}`);
      return true; // Xato emas, maqsadga erishilgan deb hisoblaymiz
    }

    // 401 xatosi kalitlar xato ekanligini bildiradi
    if (error.response?.status === 401) {
      console.error(
        "❌ Uploadcare API kalitlari xato! .env faylni tekshiring.",
      );
      console.error(
        `Public: ${process.env.UPLOADCARE_PUBLIC_KEY ? "Bor" : "Yo'q"}`,
      );
    }

    console.error(
      "❌ Uploadcare delete xato:",
      error.response?.data || error.message,
    );
    return false; // O'chirishda xatolik bo'ldi
  }
};

module.exports = deleteFromCloud;
