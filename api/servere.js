// 引入依赖
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/event_db');

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------- 核心 API 端点 --------------------------
/**
 * 1. 首页数据端点：获取upcoming事件（自动返回purpose字段）
 */
app.get('/api/events/upcoming', async (req, res) => {
  try {
    const query = `
      SELECT e.*, c.name AS category_name, o.name AS org_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE e.is_suspended = FALSE 
        AND e.date > CURRENT_TIMESTAMP
      ORDER BY e.date ASC
    `;
    const [results] = await pool.query(query);

    // 数值类型转换（含purpose字段，无需额外处理）
    const formattedEvents = results.map(event => ({
      ...event,
      ticket_price: Number(event.ticket_price),
      goal_amount: Number(event.goal_amount),
      current_amount: Number(event.current_amount),
      date: event.date.toString()
    }));

    res.status(200).json(formattedEvents);
  } catch (err) {
    console.error('首页 API 错误：', err);
    res.status(500).json({ error: 'Server error: Failed to load upcoming events' });
  }
});

/**
 * 2. 搜索端点：筛选事件（自动返回purpose字段）
 */
app.get('/api/events/search', async (req, res) => {
  try {
    const { date, location, categoryId } = req.query;
    let query = `
      SELECT e.*, c.name AS category_name, o.name AS org_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE e.is_suspended = FALSE
    `;
    const params = [];

    if (date) {
      query += ' AND DATE(e.date) = ?';
      params.push(date);
    }
    if (location) {
      query += ' AND e.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (categoryId) {
      query += ' AND e.category_id = ?';
      params.push(categoryId);
    }

    const [results] = await pool.query(query, params);

    // 数值类型转换
    const formattedEvents = results.map(event => ({
      ...event,
      ticket_price: Number(event.ticket_price),
      goal_amount: Number(event.goal_amount),
      current_amount: Number(event.current_amount),
      date: event.date.toString()
    }));

    res.status(200).json(formattedEvents);
  } catch (err) {
    console.error('搜索 API 错误：', err);
    res.status(500).json({ error: 'Server error: Failed to search events' });
  }
});

/**
 * 3. 事件详情端点：获取单个事件（自动返回purpose字段）
 */
app.get('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const query = `
      SELECT e.*, c.name AS category_name, o.*
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE e.id = ? AND e.is_suspended = FALSE
    `;
    const [results] = await pool.query(query, [eventId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Event not found or suspended' });
    }

    // 数值类型转换
    const event = results[0];
    const formattedEvent = {
      ...event,
      ticket_price: Number(event.ticket_price),
      goal_amount: Number(event.goal_amount),
      current_amount: Number(event.current_amount),
      date: event.date.toString()
    };

    res.status(200).json(formattedEvent);
  } catch (err) {
    console.error('详情 API 错误：', err);
    res.status(500).json({ error: 'Server error: Failed to load event details' });
  }
});

/**
 * 4. 类别端点
 */
app.get('/api/categories', async (req, res) => {
  try {
    const query = 'SELECT * FROM categories ORDER BY name ASC';
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error('类别 API 错误：', err);
    res.status(500).json({ error: 'Server error: Failed to load categories' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API 服务器已启动：http://localhost:${PORT}`);
  console.log('可用端点：');
  console.log('1. 首页事件：GET /api/events/upcoming');
  console.log('2. 搜索事件：GET /api/events/search?date=xxx&location=xxx&categoryId=xxx');
  console.log('3. 事件详情：GET /api/events/:id');
  console.log('4. 获取类别：GET /api/categories');
});
