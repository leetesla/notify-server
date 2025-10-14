const db = require('./db');

// 查询所有信号数据
db.all('SELECT * FROM signals', [], (err, rows) => {
  if (err) {
    console.error('Error querying database:', err.message);
  } else {
    console.log('Signals in database:');
    rows.forEach(row => {
      console.log(row);
    });
  }
});

// 关闭数据库连接
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});