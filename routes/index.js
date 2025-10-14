var express = require('express');
var router = express.Router();
const db = require('../database/db');
const { formatMarketCap, toInteger, formatMultiplier, formatPercentage } = require('../utils/formatters');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST /debot-signals */
router.post('/debot-signals', function(req, res, next) {
  console.log('Received POST request at /debot-signals');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  // 获取请求体数据
  const { signals } = req.body;
  
  // 统计插入和跳过的记录数
  let insertedCount = 0;
  let skippedCount = 0;
  let processedCount = 0;
  
  // 处理每个信号
  signals.forEach((signal, index) => {
    // 将 signalIndex 转换为整数
    const signalIndexInt = toInteger(signal.signalIndex);
    
    // 将 smartWalletCount 转换为整数
    const smartWalletCountInt = toInteger(signal.smartWalletCount);
    
    // 保存原始的 marketCap 数据
    const marketCapBeforeRaw = signal.marketCapBefore;
    const marketCapAfterRaw = signal.marketCapAfter;
    
    // 格式化 marketCapBefore 和 marketCapAfter
    const marketCapBeforeFormatted = formatMarketCap(signal.marketCapBefore);
    const marketCapAfterFormatted = formatMarketCap(signal.marketCapAfter);
    
    // 保存原始的 maxIncrease 数据
    const maxIncreaseRaw = signal.maxIncrease;
    
    // 格式化 maxIncrease 数据
    let maxIncreaseFormatted;
    if (typeof signal.maxIncrease === 'string') {
      if (signal.maxIncrease.includes('x')) {
        // 处理倍数类型 (<1x, Nx)
        maxIncreaseFormatted = formatMultiplier(signal.maxIncrease);
      } else if (signal.maxIncrease.includes('%')) {
        // 处理百分比类型
        maxIncreaseFormatted = formatPercentage(signal.maxIncrease);
      } else {
        // 其他情况尝试直接转换
        maxIncreaseFormatted = parseFloat(signal.maxIncrease) || signal.maxIncrease;
      }
    } else {
      maxIncreaseFormatted = signal.maxIncrease;
    }
    
    // 使用 INSERT OR IGNORE 来避免重复数据
    db.run(`INSERT OR IGNORE INTO signals (
      signalIndex, tokenAddress, tokenName, 
      maxIncrease, maxIncreaseRaw, smartWalletCount, avgBuyAmount, marketCapBeforeRaw, 
      marketCapAfterRaw, marketCapBefore, marketCapAfter, priceBefore, priceAfter
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      signalIndexInt,
      signal.tokenAddress,
      signal.tokenName,
      maxIncreaseFormatted,
      maxIncreaseRaw,
      smartWalletCountInt,
      signal.avgBuyAmount,
      marketCapBeforeRaw,
      marketCapAfterRaw,
      marketCapBeforeFormatted,
      marketCapAfterFormatted,
      signal.priceBefore,
      signal.priceAfter
    ], function(err) {
      processedCount++;
      
      if (err) {
        console.error('Error inserting signal:', err.message);
      } else {
        // 如果 lastID 存在，说明插入了新记录
        if (this.lastID) {
          console.log(`Signal ${signalIndexInt} for token ${signal.tokenAddress} inserted with rowid ${this.lastID}`);
          insertedCount++;
        } else {
          console.log(`Signal ${signalIndexInt} for token ${signal.tokenAddress} already exists, skipped.`);
          skippedCount++;
        }
      }
      
      // 当所有记录都处理完时，返回响应
      if (processedCount === signals.length) {
        // 返回成功响应
        res.status(200).json({ 
          message: 'Request received successfully and data processed',
          timestamp: new Date().toISOString(),
          signalCount: signals.length,
          insertedCount: insertedCount,
          skippedCount: skippedCount
        });
      }
    });
  });
});

/* GET /signals - 查询所有信号数据 */
router.get('/signals', function(req, res, next) {
  db.all('SELECT * FROM signals ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error querying database:', err.message);
      res.status(500).json({ error: 'Database query error' });
    } else {
      res.status(200).json({ 
        message: 'Signals retrieved successfully',
        count: rows.length,
        signals: rows
      });
    }
  });
});

module.exports = router;