const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const config = require('../config/index');

// 创建 InfluxDB 客户端
const influxDB = new InfluxDB({ url: config.INFLUXDB_URL, token: config.INFLUXDB_TOKEN });

/**
 * 安全地将值转换为浮点数
 * @param {*} value - 要转换的值
 * @returns {number|null} 转换后的浮点数，如果无法转换则返回null
 */
function safeParseFloat(value) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * 将 DEX 价格信息保存到 InfluxDB
 * @param {Array} data - DEX 价格数据数组
 * @param {Map} tokenNameMap - token地址到名称的映射
 */
async function saveDexPriceData(data, tokenNameMap = new Map()) {
  try {
    // 每次调用时创建新的 writeApi 实例
    const writeApi = influxDB.getWriteApi(config.INFLUXDB_ORG, config.INFLUXDB_BUCKET, 'ns');
    
    const points = [];
    
    // 遍历数据并创建 Point 对象
    for (const item of data) {
      // 创建 tag: token_name:token_address
      const tokenName = tokenNameMap.get(item.tokenContractAddress) || 'Unknown';
      const tag = `${tokenName}:${item.tokenContractAddress}`;
      
      // 时间只精确到分钟
      const timeInMinutes = Math.floor(parseInt(item.time) / 60000) * 60000;
      
      // 创建 Point
      const point = new Point('dex_price_info')
        .tag('token', tag)
        .timestamp(new Date(timeInMinutes), 'ms');
      
      // 添加字段，统一使用字符串类型存储所有字段值
      for (const [key, value] of Object.entries(item)) {
        // 跳过时间戳和地址字段，因为它们已经用于 tag 或时间戳
        if (key === 'time' || key === 'tokenContractAddress') {
          continue;
        }
        
        // 统一使用字符串类型存储所有字段值
        point.stringField(key, String(value));
      }
      
      points.push(point);
    }
    
    // 写入数据
    writeApi.writePoints(points);
    await writeApi.close();
    
    console.log(`Successfully wrote ${points.length} points to InfluxDB`);
  } catch (error) {
    console.error('Error writing to InfluxDB:', error);
  }
}

module.exports = {
  saveDexPriceData
};