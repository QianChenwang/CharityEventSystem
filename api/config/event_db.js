const mysql = require('mysql2/promise');
require('dotenv').config();

// 兼容本地和cPanel环境的配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// 连接测试（部署时自动验证）
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ 数据库连接成功：${dbConfig.database}`);
    connection.release();
  } catch (err) {
    console.error(`❌ 数据库连接失败：${err.message}`);
    process.exit(1); // 连接失败时终止服务
  }
}

// 仅在启动时测试连接
testConnection();

module.exports = pool;
