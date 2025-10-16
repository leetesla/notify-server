const db = require('./db');

/**
 * 根据token地址数组批量获取token名称映射
 * @param {Array<string>} tokenAddresses - token地址数组
 * @returns {Promise<Map<string, string>>} token地址到名称的映射
 */
async function getTokenNameMap(tokenAddresses) {
  return new Promise((resolve, reject) => {
    if (!tokenAddresses || tokenAddresses.length === 0) {
      resolve(new Map());
      return;
    }

    // 创建占位符
    const placeholders = tokenAddresses.map(() => '?').join(',');
    const query = `SELECT tokenAddress, tokenName FROM signals WHERE tokenAddress IN (${placeholders}) AND tokenName IS NOT NULL`;

    db.all(query, tokenAddresses, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const tokenNameMap = new Map();
        rows.forEach(row => {
          if (row.tokenName) {
            tokenNameMap.set(row.tokenAddress, row.tokenName);
          }
        });
        resolve(tokenNameMap);
      }
    });
  });
}

// 查询所有信号数据
// db.all('SELECT * FROM signals', [], (err, rows) => {
//   if (err) {
//     console.error('Error querying database:', err.message);
//   } else {
//     console.log('Signals in database:');
//     rows.forEach(row => {
//       console.log(row);
//     });
//   }
// });

// 关闭数据库连接
// db.close((err) => {
//   if (err) {
//     console.error('Error closing database:', err.message);
//   } else {
//     console.log('Database connection closed.');
//   }
// });

module.exports = {
  getTokenNameMap
};