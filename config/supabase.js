// config/supabase.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE KALITLARI TOPILMADI! .env faylni tekshiring.");
  throw new Error("Supabase konfiguratsiyasi xato!");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
