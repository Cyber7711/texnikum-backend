const axios = require("axios");

const deleteFromCloud = async (uuid) => {
  if (!uuid) return;

  try {
    await axios.delete(`https://api.uploadcare.com/files/${uuid}/`, {
      headers: {
        Authorization:
          "Uploadcare.Account cfdd5a9996f2d83995d9:0f2c3168a2960db0efc3",
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
