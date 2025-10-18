// 引入 mysql2（支持 Promise，模块4内容）
const mysql = require('mysql2/promise');
// 加载环境变量（避免硬编码密码）
require('dotenv').config();

// 数据库配置（从 .env 读取，作业要求安全存储）
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // 必须在 .env 中配置
  database: 'charityevents_db',     // 作业要求的数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池（模块4：高效连接管理）
const pool = mysql.createPool(dbConfig);

// 测试连接（作业要求验证连接有效性）
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功！（charityevents_db）');
    connection.release();
  } catch (err) {
    console.error('❌ 数据库连接失败：', err.message);
    console.error('请检查：1. MySQL 服务是否启动 2. .env 中的密码是否正确');
    process.exit(1); // 连接失败退出，避免后续错误
  }
}

// 初始化时测试连接
testConnection();

// 导出连接池，供 API 使用
module.exports = pool;
