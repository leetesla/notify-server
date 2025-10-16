#!/usr/bin/env node

/**
 * 脚本功能：清空 Redis 列表 ALERT_LIVE
 */

const redisClient = require('../config/redis');
const config = require('../config/index');

// 主函数
async function main() {
  try {
    console.log('开始清空 ALERT_LIVE 列表...');
    
    // 获取清空前的列表长度
    const initialLength = await redisClient.llen(config.REDIS_KEYS.ALERT_LIVE);
    console.log(`清空前 ALERT_LIVE 列表长度: ${initialLength}`);
    
    // 清空 ALERT_LIVE 列表
    await redisClient.del(config.REDIS_KEYS.ALERT_LIVE);
    console.log('已清空 ALERT_LIVE 列表');
    
    // 获取清空后的列表长度
    const finalLength = await redisClient.llen(config.REDIS_KEYS.ALERT_LIVE);
    console.log(`清空后 ALERT_LIVE 列表长度: ${finalLength}`);
    
    console.log('\n脚本执行完成。');
  } catch (error) {
    console.error('执行过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// 执行主函数
main();