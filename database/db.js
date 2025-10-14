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
    signalIndex INTEGER,
    tokenAddress TEXT,
    tokenName TEXT,
    maxIncrease TEXT,
    maxIncreaseRaw TEXT,
    smartWalletCount INTEGER,
    avgBuyAmount REAL,
    marketCapBeforeRaw TEXT,
    marketCapAfterRaw TEXT,
    marketCapBefore REAL,
    marketCapAfter REAL,
    priceBefore REAL,
    priceAfter REAL,
    createdAt DATETIME DEFAULT (datetime('now', '+8 hours'))
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