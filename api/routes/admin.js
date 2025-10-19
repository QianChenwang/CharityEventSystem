const express = require('express');
const router = express.Router();
const pool = require('../config/event_db');

// 1. 获取所有事件（含暂停的）
router.get('/events', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, c.name AS category_name, o.name AS organization_name
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN organizations o ON e.organization_id = o.id
      ORDER BY e.date DESC
    `);
    res.json(events);
  } catch (err) {
    console.error('管理员获取事件列表错误：', err);
    res.status(500).json({ error: 'Failed to load all events (admin)' });
  }
});

// 2. 新增事件
router.post('/events', async (req, res) => {
  try {
    const {
      name, description, purpose, date, location,
      ticket_price, goal_amount, category_id, latitude, longitude
    } = req.body;

    if (!name || !description || !purpose || !date || !location || !category_id) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const organization_id = 1; // 默认关联第一个机构

    const [result] = await pool.query(`
      INSERT INTO events (
        name, description, purpose, date, location, ticket_price,
        goal_amount, current_amount, category_id, organization_id, latitude, longitude, is_suspended
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, ?, ?, ?, ?, FALSE)
    `, [
      name, description, purpose, date, location, ticket_price,
      goal_amount, category_id, organization_id, latitude, longitude
    ]);

    res.status(201).json({
      message: 'Event created successfully (admin)',
      event_id: result.insertId
    });
  } catch (err) {
    console.error('管理员新增事件错误：', err);
    res.status(500).json({ error: 'Failed to create event (admin)' });
  }
});

// 3. 更新事件
router.put('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      name, description, purpose, date, location,
      ticket_price, goal_amount, category_id, is_suspended, latitude, longitude
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Event not found (admin)' });
    }

    await pool.query(`
      UPDATE events SET
        name = ?, description = ?, purpose = ?, date = ?, location = ?,
        ticket_price = ?, goal_amount = ?, category_id = ?, is_suspended = ?,
        latitude = ?, longitude = ?
      WHERE id = ?
    `, [
      name, description, purpose, date, location, ticket_price,
      goal_amount, category_id, is_suspended, latitude, longitude, eventId
    ]);

    res.json({ message: 'Event updated successfully (admin)' });
  } catch (err) {
    console.error('管理员更新事件错误：', err);
    res.status(500).json({ error: 'Failed to update event (admin)' });
  }
});

// 4. 删除事件
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    const [registrations] = await pool.query(
      'SELECT registration_id FROM registrations WHERE event_id = ?',
      [eventId]
    );
    if (registrations.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete event with existing registrations. Delete registrations first.'
      });
    }

    const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Event not found (admin)' });
    }

    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
    res.json({ message: 'Event deleted successfully (admin)' });
  } catch (err) {
    console.error('管理员删除事件错误：', err);
    res.status(500).json({ error: 'Failed to delete event (admin)' });
  }
});

module.exports = router;
