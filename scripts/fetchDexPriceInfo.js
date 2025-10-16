const db = require('../database/db');
const config = require('../config/index');
const axios = require('axios');
const { saveDexPriceData } = require('../utils/influxdb');
const { getTokenNameMap } = require('../database/query');
const redisClient = require('../config/redis');
const { formatMarketCapToString } = require('../utils/formatters');

/**
 * 从数据库获取最近6小时的不重复token地址
 * @returns {Promise<Array<string>>}
 */
async function getRecentTokenAddresses() {
  return new Promise((resolve, reject) => {
    // 查询最近6小时的数据，并按tokenAddress去重
    const query = `
      SELECT DISTINCT tokenAddress 
      FROM signals 
      WHERE createdAt >= datetime('now', '-6 hours')
      AND tokenAddress IS NOT NULL 
      AND tokenAddress != ''
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // 提取tokenAddress数组
        const tokenAddresses = rows.map(row => row.tokenAddress);
        resolve(tokenAddresses);
      }
    });
  });
}

/**
 * 分批发送请求到/dex-price-info接口
 * @param {Array<string>} tokenAddresses
 */
async function sendBatchRequests(tokenAddresses) {
  // 检查必要的配置
  if (!config.OKX_PROXY_API_URL || !config.OKX_PROXY_API_SECRET) {
    console.error('Missing OKX proxy configuration');
    return;
  }

  // 从数据库获取token名称映射
  console.log('Fetching token name mapping from database...');
  const tokenNameMap = await getTokenNameMap(tokenAddresses);
  console.log(`Retrieved ${tokenNameMap.size} token name mappings`);

  // 每批最多100个地址
  const batchSize = 100;
  const batches = [];
  
  // 将地址分成批次
  for (let i = 0; i < tokenAddresses.length; i += batchSize) {
    batches.push(tokenAddresses.slice(i, i + batchSize));
  }
  
  console.log(`Total token addresses: ${tokenAddresses.length}`);
  console.log(`Number of batches: ${batches.length}`);
  
  // 依次发送每个批次的请求
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Sending batch ${i + 1}/${batches.length} with ${batch.length} addresses`);
    
    try {
      const response = await axios.post(`${config.OKX_PROXY_API_URL}/dex-price-info`, {
        token_addrs: batch,
          chain_index: 56 // BSC 56
      }, {
        headers: {
          'API-SECRET': config.OKX_PROXY_API_SECRET,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Batch ${i + 1} response status:`, response.status);
      // console.log(response.data)
      
      // 处理响应数据并保存到 InfluxDB，传递tokenNameMap
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`Processing ${response.data.data.length} data points`);
        // 检查volume5M是否大于配置的阈值，并将符合条件的数据添加到Redis
        await checkAndAddToRedis(response.data.data, tokenNameMap);
        await saveDexPriceData(response.data.data, tokenNameMap);
      }
      
      // 如果不是最后一个批次，等待3秒
      if (i < batches.length - 1) {
        console.log('Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`Error sending batch ${i + 1}:`, error.message);
      // 如果不是最后一个批次，仍然等待3秒
      if (i < batches.length - 1) {
        console.log('Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('Fetching recent token addresses from database...');
    const tokenAddresses = await getRecentTokenAddresses();
    console.log(`Found ${tokenAddresses.length} unique token addresses in the last 6 hours`);
    
    if (tokenAddresses.length === 0) {
      console.log('No token addresses found, exiting.');
      return;
    }
    
    await sendBatchRequests(tokenAddresses);
    console.log('All batches processed.');
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

/**
 * 检查volume5M是否大于配置的阈值，并将符合条件的数据添加到Redis
 * @param {Array} data - DEX价格数据数组
 * @param {Map} tokenNameMap - token地址到名称的映射
 */
async function checkAndAddToRedis(data, tokenNameMap) {
  try {
    // 获取配置的VOLUME_5M阈值，默认为0
    const volumeThreshold = parseFloat(process.env.VOLUME_5M) || 0;
    
    // 获取冷却时间配置（秒），默认300秒（5分钟）
    const cooldownTime = parseInt(process.env.COOLDOWN_TIME) || 300;
    
    // 遍历数据，检查volume5M是否大于阈值
    for (const item of data) {
      const tokenAddress = item.tokenContractAddress || '';
      const volume5M = parseFloat(item.volume5M) || 0;
      const marketCap = parseFloat(item.marketCap) || 0;
      const marketCapStr = formatMarketCapToString(marketCap);
      
      // 如果tokenAddress不为空且在redis list: ALERT_EXCEPT 中，则跳过
      if (tokenAddress) {
        const isExcepted = await redisClient.lrange(config.REDIS_KEYS.ALERT_EXCEPT, 0, -1)
          .then(list => list.includes(tokenAddress));
        if (isExcepted) {
          console.log(`Token ${tokenAddress} is in ALERT_EXCEPT list, skipping...`);
          continue;
        }
      }
      
      // 如果volume5M大于阈值
      if (volume5M > volumeThreshold) {
        // 获取token名称和地址
        const tokenName = tokenNameMap.get(item.tokenContractAddress) || 'Unknown';
        
        // 检查是否在冷却期内
        const cooldownKey = `cooldown:${tokenAddress}`;
        const lastAlertTime = await redisClient.get(cooldownKey);
        const currentTime = Math.floor(Date.now() / 1000);
        
        // 如果还在冷却期内，则跳过
        if (lastAlertTime && (currentTime - parseInt(lastAlertTime)) < cooldownTime) {
          console.log(`Token ${tokenName} (${tokenAddress}) is in cooldown period, skipping Redis write`);
          continue;
        }
        
        // 获取当前本地日期
        const currentDate = new Date().toLocaleString('zh-CN', { 
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        // 构造要添加到Redis的内容
        const redisContent = `${tokenName} ${tokenAddress}\nvolume5M=${volume5M} MC=${marketCapStr}\n${currentDate}`;
        
        // 向Redis的ALERT_LOG和ALERT_LIVE列表中添加内容
        await redisClient.lpush(config.REDIS_KEYS.ALERT_LOG, redisContent);
        await redisClient.lpush(config.REDIS_KEYS.ALERT_LIVE, redisContent);
        
        // 设置冷却时间
        await redisClient.setex(cooldownKey, cooldownTime, currentTime.toString());
        
        console.log(`Added to Redis: ${tokenName} ${tokenAddress} volume5M=${volume5M} MC=${marketCapStr}`);
      }
    }
  } catch (error) {
    console.error('Error checking volume and adding to Redis:', error.message);
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getRecentTokenAddresses,
  sendBatchRequests,
  main,
  checkAndAddToRedis
};