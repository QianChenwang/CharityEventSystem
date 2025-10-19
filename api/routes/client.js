const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const pool = require('../config/event_db');

// 1. 获取单个事件详情+注册列表
router.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const [results] = await pool.query(`
      SELECT e.*, c.name AS category_name, o.*,
             r.registration_id, r.full_name, r.email, r.phone, 
             r.ticket_quantity, r.registration_date
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ? AND e.is_suspended = FALSE
      ORDER BY r.registration_date DESC
    `, [eventId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Event not found or suspended' });
    }

    const event = { ...results[0] };
    event.registrations = results
      .filter(item => item.registration_id)
      .map(item => ({
        registration_id: item.registration_id,
        full_name: item.full_name,
        email: item.email,
        phone: item.phone,
        ticket_quantity: item.ticket_quantity,
        registration_date: item.registration_date
      }));

    ['registration_id', 'full_name', 'email', 'phone', 'ticket_quantity', 'registration_date'].forEach(key => {
      delete event[key];
    });

    res.json(event);
  } catch (err) {
    console.error('事件详情API错误：', err);
    res.status(500).json({ error: 'Failed to load event details' });
  }
});

// 2. 获取所有未暂停的事件
router.get('/events', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, c.name AS category_name, o.name AS organization_name
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN organizations o ON e.organization_id = o.id
      WHERE e.is_suspended = FALSE
      ORDER BY e.date DESC
    `);

    res.json(events);
  } catch (err) {
    console.error('获取所有事件API错误：', err);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// 3. 用户注册事件
router.post('/registrations', async (req, res) => {
  try {
    const { event_id, full_name, email, phone, ticket_quantity } = req.body;

    if (!event_id || !full_name || !email || !phone || !ticket_quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (ticket_quantity < 1) {
      return res.status(400).json({ error: 'Ticket quantity must be at least 1' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const [event] = await pool.query(
      'SELECT ticket_price FROM events WHERE id = ? AND is_suspended = FALSE',
      [event_id]
    );
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found or suspended' });
    }

    const total_amount = event[0].ticket_price * ticket_quantity;

    const [existing] = await pool.query(
      'SELECT * FROM registrations WHERE email = ? AND event_id = ?',
      [email, event_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You already registered for this event' });
    }

    await pool.query(`
      INSERT INTO registrations (
        event_id, full_name, email, phone, ticket_quantity, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [event_id, full_name, email, phone, ticket_quantity, total_amount]);

    res.status(201).json({ message: 'Registration successful! Thank you.' });
  } catch (err) {
    console.error('注册API错误：', err);
    res.status(500).json({ error: 'Failed to process registration' });
  }
});

// 4. 获取事件天气
router.get('/events/:id/weather', async (req, res) => {
  try {
    const [events] = await pool.query(
      'SELECT latitude, longitude, date FROM events WHERE id = ?',
      [req.params.id]
    );
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

    const { latitude, longitude, date } = events[0];
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Weather data unavailable for this event' });
    }

    const eventDate = new Date(date).toISOString().split('T')[0];
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}&` +
      `daily=weather_code,temperature_2m_max,temperature_2m_min&` +
      `start_date=${eventDate}&end_date=${eventDate}&timezone=Australia%2FSydney`, { timeout: 5000 });
    
    if (!weatherRes.ok) throw new Error('Weather service error');
    const weather = await weatherRes.json();
    if (!weather.daily) return res.status(400).json({ error: 'No weather data' });

    const weatherMap = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 51: 'Light drizzle', 61: 'Light rain', 80: 'Light showers', 95: 'Thunderstorm'
    };

    res.json({
      date: eventDate,
      weather: weatherMap[weather.daily.weather_code[0]] || 'Unknown',
      temp_max: `${weather.daily.temperature_2m_max[0]}°C`,
      temp_min: `${weather.daily.temperature_2m_min[0]}°C`
    });
  } catch (err) {
    console.error('天气接口错误：', err);
    res.status(500).json({ error: 'Failed to load weather data' });
  }
});

module.exports = router;
