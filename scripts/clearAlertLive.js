#!/usr/bin/env node

/**
 * 脚本功能：清空 Redis 列表 ALERT_LIVE
 */

const redisClient = require('../config/redis');
const config = require('../config/index');

// 主函数
async function main() {
  try {
    console.log('🚀 开始清空 ALERT_LIVE 列表...');
    
    // 获取清空前的列表长度
    const initialLength = await redisClient.llen(config.REDIS_KEYS.ALERT_LIVE);
    console.log(`📊 清空前 ALERT_LIVE 列表长度: ${initialLength}`);
    
    // 如果列表不为空，则获取所有内容并显示
    if (initialLength > 0) {
      console.log('📋 将要清空的内容:');
      console.log('*********************************   ');
      const allItems = await redisClient.lrange(config.REDIS_KEYS.ALERT_LIVE, 0, -1);
      
      // 显示每个将要被清空的项目
      allItems.forEach((item, index) => {
        console.log(`${index + 1}. 📝 ${item}`);
      });
      console.log('*********************************   ');
      console.log(`💥 总共 ${allItems.length} 个项目将被清空`);
    } else {
      console.log('✅ ALERT_LIVE 列表已经是空的');
    }
    
    // 清空 ALERT_LIVE 列表
    await redisClient.del(config.REDIS_KEYS.ALERT_LIVE);
    console.log('✅ 已清空 ALERT_LIVE 列表');
    
    // 获取清空后的列表长度
    const finalLength = await redisClient.llen(config.REDIS_KEYS.ALERT_LIVE);
    console.log(`📊 清空后 ALERT_LIVE 列表长度: ${finalLength}`);
    
    console.log('🎉 脚本执行完成。');
  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// 执行主函数
main();