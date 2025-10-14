const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.resolve(__dirname, 'signals.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 创建 signals 表
db.serialize(() => {
  // 创建表
  db.run(`CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    signalCount INTEGER,
    signalIndex INTEGER,
    tokenAddress TEXT,
    tokenName TEXT,
    maxIncrease TEXT,
    smartWalletCount TEXT,
    avgBuyAmount TEXT,
    marketCapBefore TEXT,
    marketCapAfter TEXT,
    priceBefore TEXT,
    priceAfter TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Signals table created or already exists.');
    }
  });
  
  // 添加唯一约束以避免重复数据
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_token_signal 
    ON signals(tokenAddress, signalIndex)`, (err) => {
    if (err) {
      console.error('Error creating unique index:', err.message);
    } else {
      console.log('Unique index on tokenAddress and signalIndex created or already exists.');
    }
  });
});

module.exports = db;