const ADMIN_API_BASE = 'http://localhost:3000/api/admin';
const CLIENT_API_BASE = 'http://localhost:3000/api'; // 用于获取事件详情（复用客户端API）

document.addEventListener('DOMContentLoaded', () => {
  const errorEl = document.getElementById('errorAlert');
  const successEl = document.getElementById('successAlert');
  const formCard = document.getElementById('formCard');
  const loadingState = document.getElementById('loadingState');

  // 初始化提示
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  // 1. 从URL获取事件ID
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    showAlert('error', 'No event ID found. Please select an event from the list.');
    loadingState.textContent = 'Error: No event ID provided';
    return;
  }

  // 2. 加载事件详情（复用客户端API，减少重复开发）
  loadEventDetails(eventId);

  // 3. 表单提交处理
  document.getElementById('editEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    // 收集编辑后的数据
    const updatedData = {
      name: document.getElementById('eventName').value.trim(),
      description: document.getElementById('eventDescription').value.trim(),
      purpose: document.getElementById('eventPurpose').value.trim(),
      date: document.getElementById('eventDate').value,
      location: document.getElementById('eventLocation').value.trim(),
      ticket_price: parseFloat(document.getElementById('ticketPrice').value),
      goal_amount: parseFloat(document.getElementById('goalAmount').value),
      category_id: parseInt(document.getElementById('eventCategory').value),
      is_suspended: document.getElementById('isSuspended').checked, // 暂停状态
      latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
      longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null
    };

    // 客户端验证
    if (!validateFormData(updatedData)) {
      return;
    }

    // 4. 提交更新到管理员API
    try {
      const response = await fetch(`${ADMIN_API_BASE}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update event');
      }

      // 更新成功：提示+跳转
      successEl.textContent = responseData.message;
      successEl.style.display = 'block';
      
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 2000);

    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
      console.error('Update event error:', err);
    }
  });
});

// 加载事件详情（填充到表单）
async function loadEventDetails(eventId) {
  try {
    const response = await fetch(`${CLIENT_API_BASE}/events/${eventId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Event not found or suspended');
    }

    const event = await response.json();
    const form = document.getElementById('editEventForm');

    // 填充表单字段（与事件数据一一对应）
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventPurpose').value = event.purpose;
    // 格式化datetime-local（需转换为ISO格式并去掉时区）
    document.getElementById('eventDate').value = new Date(event.date).toISOString().slice(0, 16);
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('ticketPrice').value = event.ticket_price;
    document.getElementById('goalAmount').value = event.goal_amount;
    document.getElementById('eventCategory').value = event.category_id;
    document.getElementById('latitude').value = event.latitude || '';
    document.getElementById('longitude').value = event.longitude || '';
    document.getElementById('isSuspended').checked = event.is_suspended; // 暂停状态

    // 显示表单，隐藏加载状态
    document.getElementById('formCard').style.display = 'block';
    document.getElementById('loadingState').style.display = 'none';

  } catch (err) {
    showAlert('error', err.message);
    document.getElementById('loadingState').textContent = `Error: ${err.message}`;
    console.error('Load event details error:', err);
  }
}

// 表单数据验证（复用新增事件的验证逻辑）
function validateFormData(data) {
  const errorEl = document.getElementById('errorAlert');

  if (!data.name || !data.description || !data.purpose) {
    errorEl.textContent = 'Event name, description, and purpose are required';
    errorEl.style.display = 'block';
    return false;
  }

  const eventDate = new Date(data.date);
  const now = new Date();
  if (eventDate < now.setHours(0, 0, 0, 0)) {
    errorEl.textContent = 'Event date cannot be in the past';
    errorEl.style.display = 'block';
    return false;
  }

  if (isNaN(data.ticket_price) || data.ticket_price < 0) {
    errorEl.textContent = 'Ticket price cannot be negative';
    errorEl.style.display = 'block';
    return false;
  }
  if (isNaN(data.goal_amount) || data.goal_amount < 0) {
    errorEl.textContent = 'Fundraiser goal cannot be negative';
    errorEl.style.display = 'block';
    return false;
  }

  return true;
}

// 显示提示信息
function showAlert(type, message) {
  const errorEl = document.getElementById('errorAlert');
  const successEl = document.getElementById('successAlert');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (type === 'error') {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  } else if (type === 'success') {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
}
