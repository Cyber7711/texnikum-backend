const axios = require("axios");

const deleteFromCloud = async (uuid) => {
  // 1. UUID mavjudligini tekshirish
  if (!uuid) return;

  // 2. UUID oxiridagi ortiqcha sleshlarni olib tashlash
  const cleanUuid = uuid.toString().replace(/\/$/, "");

  try {
    // 3. API so'rovi
    await axios.delete(`https://api.uploadcare.com/files/${cleanUuid}/`, {
      headers: {
        // MUHIM: Public va Secret keylar o'rtasida ":" bo'lishi shart
        Authorization: `Uploadcare.Account ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    });

    console.log(`✅ Uploadcare fayl o‘chirildi: ${cleanUuid}`);
  } catch (error) {
    // 404 xatosi fayl allaqachon o'chirilganini bildiradi, bu xato emas
    if (error.response?.status === 404) {
      console.warn(
        `⚠️ Fayl topilmadi (allaqachon o'chirilgan bo'lishi mumkin): ${cleanUuid}`
      );
      return;
    }

    // 401 xatosi kalitlar xato ekanligini bildiradi
    if (error.response?.status === 401) {
      console.error(
        "❌ Uploadcare API kalitlari xato! Secret Keyni tekshiring."
      );
    }

    console.error(
      "❌ Uploadcare delete xato:",
      error.response?.data || error.message
    );
  }
};

module.exports = deleteFromCloud;
