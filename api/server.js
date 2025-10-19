require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/event_db');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 根路径测试
app.get('/', (req, res) => {
  res.json({ 
    message: 'Charity Event API is running',
    client_endpoints: 'GET /api/events, GET /api/events/:id, POST /api/registrations',
    admin_endpoints: 'GET /api/admin/events, POST /api/admin/events, PUT /api/admin/events/:id, DELETE /api/admin/events/:id'
  });
});

// 挂载路由
app.use('/api', clientRoutes);       // 客户端接口
app.use('/api/admin', adminRoutes);  // 管理员接口

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  pool.end().then(() => process.exit(1));
});
