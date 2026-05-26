const { createClient } = require("redis");

// Agar .env faylda REDIS_URL bo'lsa (Production), o'shani oladi,
// yo'q bo'lsa, kompyuteringdagi local Redis'ga ulanadi (Development).
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const client = createClient({
  url: redisUrl,
  socket: {
    // Bulutli Redis xavfsiz ulanish (TLS) talab qilsa, ishga tushadi
    tls: redisUrl.startsWith("rediss://") || redisUrl.includes("upstash.io"),
  },
});

client.on("error", (err) => console.error("❌ Redis Error:", err));
client.on("connect", () => console.log("🚀 Redis Connected Successfully!"));

(async () => {
  if (!client.isOpen) {
    await client.connect();
  }
})();

module.exports = client;
