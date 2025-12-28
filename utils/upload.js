const uploadToCloud = async (file) => {
  if (!file || !file.buffer) return null;

  try {
    const result = await uploadFile(file.buffer, {
      publicKey: `${process.env.UPLOADCARE_PUBLIC_KEY}`,
      store: "1", // Ba'zi versiyalarda true o'rniga '1' (string) kiritish ishonchliroq
      fileName: file.originalname,
    });

    console.log("🚀 Yuklangan fayl to'liq ma'lumoti:", result);
    // result.isStored qiymatini terminalda tekshiring. U true bo'lishi kerak.

    return result.uuid;
  } catch (error) {
    console.error("❌ Uploadcare yuklashda xato:", error);
    throw error;
  }
};
