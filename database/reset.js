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

// 删除现有表并重新创建
db.serialize(() => {
  // 删除现有表
  db.run(`DROP TABLE IF EXISTS signals`, (err) => {
    if (err) {
      console.error('Error dropping table:', err.message);
    } else {
      console.log('Existing signals table dropped.');
    }
  });
  
  // 重新创建表
  db.run(`CREATE TABLE signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    signalCount INTEGER,
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
      console.log('Signals table created.');
    }
  });
  
  // 添加唯一约束
  db.run(`CREATE UNIQUE INDEX idx_token_signal 
    ON signals(tokenAddress, signalIndex)`, (err) => {
    if (err) {
      console.error('Error creating unique index:', err.message);
    } else {
      console.log('Unique index on tokenAddress and signalIndex created.');
    }
  });
});

// 关闭数据库连接
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}, 1000);