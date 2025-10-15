const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

// Redis 状态检查路由
router.get('/status', async (req, res) => {
  try {
    // 获取 Redis 服务器信息
    const info = await redisClient.info();
    
    res.json({
      success: true,
      status: redisClient.status,
      info: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: redisClient.status,
      error: error.message
    });
  }
});

// Redis 简单键值操作测试路由
router.get('/test', async (req, res) => {
  try {
    const key = 'test_key';
    const value = 'Hello Redis!';
    
    // 设置键值
    await redisClient.set(key, value);
    
    // 获取键值
    const retrievedValue = await redisClient.get(key);
    
    // 删除键
    await redisClient.del(key);
    
    res.json({
      success: true,
      message: 'Redis test successful',
      setValue: value,
      retrievedValue: retrievedValue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Redis test failed',
      error: error.message
    });
  }
});

module.exports = router;