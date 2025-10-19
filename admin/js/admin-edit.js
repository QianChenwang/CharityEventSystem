const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    showError('No event selected. Redirecting to event list...');
    setTimeout(() => window.location.href = 'admin-dashboard.html', 2000);
    return;
  }
  
  document.getElementById('eventId').value = eventId;
  loadEventDetails(eventId); // 加载事件详情
  loadRegistrations(eventId); // 加载关联的注册记录
});

// 加载事件详情（预填表单）
async function loadEventDetails(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Event not found');
    }
    const event = await response.json();

    // 预填表单
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventPurpose').value = event.purpose;
    document.getElementById('eventDate').value = new Date(event.date).toISOString().slice(0, 16); // 适配datetime-local格式
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('ticketPrice').value = event.ticket_price;
    document.getElementById('goalAmount').value = event.goal_amount;
    document.getElementById('eventCategory').value = event.category_id;
    document.getElementById('isSuspended').value = event.is_suspended ? 'TRUE' : 'FALSE';
    document.getElementById('latitude').value = event.latitude || '';
    document.getElementById('longitude').value = event.longitude || '';

    // 绑定表单提交事件
    document.getElementById('editEventForm').addEventListener('submit', (e) => {
      e.preventDefault();
      updateEvent(eventId);
    });
  } catch (err) {
    showError(err.message);
    console.error('Load event details error:', err);
  }
}

// 加载关联的注册记录
async function loadRegistrations(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    if (!response.ok) throw new Error('Failed to load registrations');
    const event = await response.json();

    const container = document.getElementById('registrationsList');
    if (event.registrations.length === 0) {
      container.innerHTML = '<p>No registrations for this event yet.</p>';
      return;
    }

    // 渲染注册列表
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
    event.registrations.forEach(reg => {
      html += `
        <tr>
          <td>${reg.full_name}</td>
          <td>${reg.email}</td>
          <td>${reg.ticket_quantity}</td>
          <td>${new Date(reg.registration_date).toLocaleString()}</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  } catch (err) {
    document.getElementById('registrationsList').textContent = 'Failed to load registrations';
    console.error('Load registrations error:', err);
  }
}

// 更新事件
async function updateEvent(eventId) {
  const errorEl = document.getElementById('editError');
  const successEl = document.getElementById('editSuccess');
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  // 获取表单数据
  const eventData = {
    name: document.getElementById('eventName').value.trim(),
    description: document.getElementById('eventDescription').value.trim(),
    purpose: document.getElementById('eventPurpose').value.trim(),
    date: document.getElementById('eventDate').value,
    location: document.getElementById('eventLocation').value.trim(),
    ticket_price: parseFloat(document.getElementById('ticketPrice').value),
    goal_amount: parseFloat(document.getElementById('goalAmount').value),
    category_id: parseInt(document.getElementById('eventCategory').value),
    is_suspended: document.getElementById('isSuspended').value === 'TRUE',
    latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
    longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null
  };

  // 验证
  if (!eventData.name || !eventData.description || !eventData.purpose || !eventData.date || !eventData.location) {
    return showError('All required fields (marked with *) must be filled');
  }
  if (isNaN(eventData.ticket_price) || eventData.ticket_price < 0) {
    return showError('Ticket price must be a positive number');
  }
  if (isNaN(eventData.goal_amount) || eventData.goal_amount < 0) {
    return showError('Goal amount must be a positive number');
  }
  if (isNaN(eventData.category_id) || eventData.category_id < 1) {
    return showError('Please select a valid category');
  }

  // 提交更新
  try {
    const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Update failed');

    successEl.textContent = 'Event updated successfully!';
    successEl.style.display = 'block';

    // 3秒后跳转到事件列表
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 3000);
  } catch (err) {
    showError(err.message);
    console.error('Update event error:', err);
  }
}

function showError(message) {
  const errorEl = document.getElementById('editError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}