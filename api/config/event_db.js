const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
pool.getConnection()
  .then(conn => {
    console.log(`✅ 数据库连接成功：${process.env.DB_NAME}`);
    conn.release();
  })
  .catch(err => {
    console.error('❌ 数据库连接失败：', err.message);
    process.exit(1);
  });

module.exports = pool;
