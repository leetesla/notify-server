const redisClient = require('../config/redis');

console.log('Redis client module loaded successfully');

// 检查客户端对象是否存在
if (redisClient) {
  console.log('Redis client instance created');
  console.log('Client status:', redisClient.status);
} else {
  console.log('Failed to create Redis client instance');
}

module.exports = redisClient;