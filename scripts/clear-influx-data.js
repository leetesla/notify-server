const { InfluxDB } = require('@influxdata/influxdb-client');
const { DeleteAPI } = require('@influxdata/influxdb-client-apis');
const config = require('../config/index');

// 创建 Influx DB 客户端
const influxDB = new InfluxDB({ url: config.INFLUXDB_URL, token: config.INFLUXDB_TOKEN });

/**
 * 清空InfluxDB中的数据
 */
async function clearInfluxData() {
  try {
    console.log('正在清空InfluxDB中的数据...');
    
    // 使用删除API
    const deletes = new DeleteAPI(influxDB);
    
    // 删除过去10年的数据
    const stop = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 10);
    
    await deletes.postDelete({
      org: config.INFLUXDB_ORG,
      bucket: config.INFLUXDB_BUCKET,
      body: {
        start: start.toISOString(),
        stop: stop.toISOString(),
        predicate: '_measurement="dex_price_info"'
      }
    });
    
    console.log('成功清空InfluxDB中的dex_price_info数据');
  } catch (error) {
    console.error('清空InfluxDB数据时出错:', error.message);
    console.error('错误详情:', error);
  }
}

/**
 * 删除整个bucket（需要特殊权限）
 */
async function dropBucket() {
  try {
    console.log('注意：删除整个bucket需要使用InfluxDB管理API');
    console.log('请使用InfluxDB CLI或Web界面来删除整个bucket');
    
    // 这需要特殊的管理权限，通常不在客户端SDK中提供
    // 你可以使用CLI命令: influx bucket delete -n bucket-name
  } catch (error) {
    console.error('删除bucket时出错:', error.message);
  }
}

// 根据命令行参数决定执行哪个操作
const action = process.argv[2];

if (require.main === module) {
  if (action === 'drop-bucket') {
    dropBucket();
  } else {
    clearInfluxData();
  }
}

module.exports = {
  clearInfluxData,
  dropBucket
};