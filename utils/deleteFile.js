const axios = require("axios");

const deleteFromCloud = async (uuid) => {
  if (!uuid) return;

  try {
    await axios.delete(`https://api.uploadcare.com/files/${uuid}/`, {
      headers: {
        Authorization: `Uploadcare.Account ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    });

    console.log("✅ Uploadcare fayl o‘chirildi:", uuid);
  } catch (error) {
    if (error.response?.status === 404) return;

    console.error(
      "❌ Uploadcare delete xato:",
      error.response?.data || error.message
    );
  }
};

module.exports = deleteFromCloud;
