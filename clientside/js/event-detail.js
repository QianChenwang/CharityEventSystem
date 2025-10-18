// 注意：部署时替换为cPanel的API地址（如 'https://你的域名.com/api'）
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  const errorEl = document.getElementById('detailError');
  errorEl.style.display = 'none';

  // 获取URL中的事件ID
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    showError('No event selected. Please return to the home page.');
    return;
  }

  // 加载事件详情和注册列表
  loadEventDetails(eventId);
  // 加载天气信息（可选）
  loadWeather(eventId);
});

// 加载事件详情和注册列表
async function loadEventDetails(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Event not found');
    }

    const event = await response.json();

    // 渲染事件基础信息
    document.getElementById('eventHeroImg').src = `images/event-${event.id}.jpg`;
    document.getElementById('eventCategoryHero').textContent = event.category_name;
    document.getElementById('eventTitleHero').textContent = event.name;
    document.getElementById('eventMetaHero').innerHTML = `
      <span><i class="fa-regular fa-calendar"></i> ${formatDate(event.date)}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${event.location}</span>
      <span><i class="fa-solid fa-building"></i> ${event.name}</span>
    `;
    document.getElementById('eventDescription').textContent = event.description;
    document.getElementById('eventPurpose').textContent = event.purpose;
    document.getElementById('orgMission').textContent = event.mission;
    document.getElementById('orgContact').textContent = `${event.contact_email} | ${event.contact_phone}`;
    document.getElementById('ticketPrice').textContent = event.ticket_price == 0 
      ? 'Free Entry' 
      : `$${Number(event.ticket_price).toFixed(2)} per ticket`;

    // 渲染筹款进度
    const progress = Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100);
    document.getElementById('currentAmount').textContent = `$${Number(event.current_amount).toFixed(2)}`;
    document.getElementById('goalAmount').textContent = `$${Number(event.goal_amount).toFixed(2)}`;
    document.getElementById('progressPercent').textContent = `${progress}% Complete`;
    document.getElementById('progressFill').style.width = `${progress}%`;

    // 渲染注册列表
    renderRegistrations(event.registrations);

    // 设置注册链接
    document.getElementById('registerLink').href = `registration.html?id=${eventId}`;

  } catch (err) {
    showError(err.message);
    console.error('加载事件失败：', err);
  }
}

// 渲染注册列表
function renderRegistrations(registrations) {
  const container = document.getElementById('registrationsList');
  
  if (registrations.length === 0) {
    container.textContent = 'No registrations yet. Be the first to register!';
    return;
  }

  let html = `
    <table class="registrations-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Tickets</th>
          <th>Registered On</th>
        </tr>
      </thead>
      <tbody>
  `;

  registrations.forEach(reg => {
    html += `
      <tr>
        <td>${reg.full_name}</td>
        <td>${reg.email}</td>
        <td>${reg.ticket_quantity}</td>
        <td>${formatDateTime(reg.registration_date)}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// 加载天气信息（可选）
async function loadWeather(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/weather`);
    if (!response.ok) throw new Error('Weather data unavailable');

    const weather = await response.json();
    document.getElementById('eventWeather').innerHTML = `
      <p><i class="fa-solid fa-cloud"></i> ${weather.weather}</p>
      <p><i class="fa-solid fa-temperature-high"></i> High: ${weather.temp_max}</p>
      <p><i class="fa-solid fa-temperature-low"></i> Low: ${weather.temp_min}</p>
    `;
  } catch (err) {
    document.getElementById('eventWeather').textContent = 'Weather data not available';
  }
}

// 工具函数：格式化日期
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-AU', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// 工具函数：格式化日期时间
function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-AU');
}

// 显示错误信息
function showError(message) {
  const errorEl = document.getElementById('detailError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  document.querySelectorAll('.loading').forEach(el => {
    el.textContent = 'Failed to load';
  });
}
