require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/client');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件（解决跨域和数据解析问题）
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由挂载（客户端API）
app.use('/api', clientRoutes);

// 根路径测试
app.get('/', (req, res) => {
  res.json({ message: 'Charity Event API (A3) is running' });
});

// 启动服务
const server = app.listen(PORT, () => {
  console.log(`API运行在 http://localhost:${PORT}`);
  console.log('客户端接口：/api/events/:id (详情+注册列表) | /api/registrations (注册)');
}).on('error', (err) => {
  console.error('服务启动失败：', err);
});

module.exports = server;
