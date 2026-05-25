const { createClient } = require("redis");
const logger = require("../utils/logger");

const client = createClient({
  url: "redis://localhost:6379",
});

client.on("error", (err) => logger.error("Redis error", err));
client.on("connect", () => logger.info("Redis connected successfully !"));

(async () => {
  await client.connect();
})();

module.exports = client;
