const db = require('../database/db');
const config = require('../config/index');
const axios = require('axios');

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
        console.log(response.data)
      // 可以在这里处理响应数据
      
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

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getRecentTokenAddresses,
  sendBatchRequests,
  main
};