const express = require('express');
const cors = require('cors');
const pool = require('./config/event_db'); // 数据库连接
const clientRoutes = require('./routes/client'); // 客户端路由
const adminRoutes = require('./routes/admin'); // 管理员路由（修正：确保已导入）

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件：允许跨域请求（开发环境用）
app.use(cors());
// 中间件：解析JSON请求体
app.use(express.json());

// 根路径测试
app.get('/', (req, res) => {
  res.json({ message: 'Charity Event API is running. Use /api for client endpoints, /api/admin for admin endpoints.' });
});

// 挂载路由（修正：明确区分客户端和管理员路由）
app.use('/api', clientRoutes); // 客户端接口：/api/...
app.use('/api/admin', adminRoutes); // 管理员接口：/api/admin/...

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 关闭数据库连接后退出
  pool.end().then(() => process.exit(1));
});
