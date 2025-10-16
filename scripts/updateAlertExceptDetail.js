#!/usr/bin/env node

/**
 * 脚本功能：
 * 1. 从Redis的ALERT_EXCEPT列表中获取token地址列表
 * 2. 根据这些地址在SQLite数据库中查询对应的token名称
 * 3. 将格式化的信息（token名称 + 空格 + token地址）保存到Redis的ALERT_EXCEPT_DETAIL列表中
 */

const redisClient = require('../config/redis');
const db = require('../database/db');
const config = require('../config/index');

// 查询数据库获取token名称的函数
function getTokenNameByAddress(tokenAddress) {
  return new Promise((resolve, reject) => {
    const query = `SELECT tokenName FROM signals WHERE tokenAddress = ? LIMIT 1`;
    db.get(query, [tokenAddress], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.tokenName : null);
      }
    });
  });
}

// 主函数
async function main() {
  try {
    console.log('开始更新 ALERT_EXCEPT_DETAIL 列表...');
    
    // 1. 从Redis获取ALERT_EXCEPT列表中的所有token地址
    const alertExceptTokens = await redisClient.lrange(config.REDIS_KEYS.ALERT_EXCEPT, 0, -1);
    console.log(`从 ALERT_EXCEPT 列表中获取到 ${alertExceptTokens.length} 个token地址`);
    
    // 2. 清空现有的ALERT_EXCEPT_DETAIL列表
    await redisClient.del(config.REDIS_KEYS.ALERT_EXCEPT_DETAIL);
    console.log('已清空 ALERT_EXCEPT_DETAIL 列表');
    
    // 3. 遍历每个token地址，查询名称并保存到ALERT_EXCEPT_DETAIL
    for (const tokenAddress of alertExceptTokens) {
      try {
        // 获取token名称
        const tokenName = await getTokenNameByAddress(tokenAddress);
        
        // 如果找到了token名称，则格式化并保存到ALERT_EXCEPT_DETAIL
        if (tokenName) {
          const formattedInfo = `${tokenName} ${tokenAddress}`;
          await redisClient.lpush(config.REDIS_KEYS.ALERT_EXCEPT_DETAIL, formattedInfo);
          console.log(`已添加: ${formattedInfo}`);
        } else {
          // 如果没有找到名称，仍然保存地址信息
          const formattedInfo = `Unknown ${tokenAddress}`;
          await redisClient.lpush(config.REDIS_KEYS.ALERT_EXCEPT_DETAIL, formattedInfo);
          console.log(`未找到名称，已添加: ${formattedInfo}`);
        }
      } catch (error) {
        console.error(`处理token地址 ${tokenAddress} 时出错:`, error.message);
      }
    }
    
    // 4. 获取并显示最终结果
    const finalList = await redisClient.lrange(config.REDIS_KEYS.ALERT_EXCEPT_DETAIL, 0, -1);
    console.log('\nALERT_EXCEPT_DETAIL 列表更新完成，最终内容:');
    finalList.forEach((item, index) => {
      console.log(`✅ ${index + 1}. ${item}`);
    });
    
    console.log('\n脚本执行完成。');
  } catch (error) {
    console.error('执行过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接时出错:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
    
    // 退出程序
    process.exit(0);
  }
}

// 执行主函数
main();