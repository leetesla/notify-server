const Redis = require('ioredis');
const config = require('./index');

// 创建 Redis 客户端实例
const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  password: config.REDIS_PASSWORD || undefined, // 使用 undefined 而不是 null
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
  }
});

// 连接事件处理
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

// 错误事件处理
redisClient.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

// 断开连接事件处理
redisClient.on('close', () => {
  console.log('Redis client disconnected');
});

// 准备就绪事件处理
redisClient.on('ready', () => {
  console.log('Redis client ready');
});

module.exports = redisClient;