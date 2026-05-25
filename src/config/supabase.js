// config/supabase.js
const { createClient } = require("@supabase/supabase-js");

// 1. .env fayldan ma'lumotlarni o'qiymiz
const supabaseUrl = process.env.SUPABASE_URL;
// RLS xatolarini chetlab o'tish uchun SERVICE_ROLE_KEY ishlatish tavsiya etiladi (Faqat Backendda!)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// 2. Kalitlar mavjudligini tekshiramiz
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ SUPABASE XATOSI: SUPABASE_URL yoki SUPABASE_KEY (.env ichida) topilmadi!",
  );
  throw new Error("Supabase konfiguratsiyasi xato. .env faylini tekshiring.");
}

// 3. Client yaratish
// Eslatman: SERVICE_ROLE_KEY ishlatilsa, RLS qoidalari chetlab o'tiladi va "violates security policy" xatosi chiqmaydi.
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Backend uchun session saqlash shart emas
  },
});

// 4. Clientni eksport qilamiz
module.exports = supabase;
