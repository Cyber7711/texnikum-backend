const redisClient = require("../config/redis");

/**
 * @desc
 */

const getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * @desc
 */

const setCache = async (key, value, ttl = 3600) => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttl,
  });
};

/**
 * @desc
 */

const delCache = async (key) => {
  await redisClient.del(key);
};

module.exports = { getCache, setCache, delCache };
