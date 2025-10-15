const dotenv = require('dotenv');
const path = require('path');

// 加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 配置对象
const config = {
  // 服务配置
  port: process.env.PORT || 3000,
  OKX_PROXY_API_SECRET: process.env.OKX_PROXY_API_SECRET || '',
  OKX_PROXY_API_URL: process.env.OKX_PROXY_API_URL || '',
  
  // Redis 配置
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  
  // 数据库配置（示例）
  // database: {
  //   host: process.env.DB_HOST || 'localhost',
  //   port: process.env.DB_PORT || 3306,
  //   username: process.env.DB_USER || 'root',
  //   password: process.env.DB_PASS || '',
  //   name: process.env.DB_NAME || 'notify_server'
  // },
  
  // 其他配置项可以在这里添加
};

module.exports = config;