const API_BASE_URL = 'http://localhost:3000/api';  // 部署时修改为cPanel地址

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');
  
  // 初始化提示状态
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  // 获取事件ID
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    showError('No event selected. Please return to the event list.');
    return;
  }
  document.getElementById('eventId').value = eventId;

  // 加载事件信息
  loadEventInfo(eventId);

  // 表单提交处理
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    // 获取表单数据
    const formData = {
      event_id: eventId,
      full_name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      ticket_quantity: parseInt(document.getElementById('ticketQuantity').value)
    };

    // 客户端验证
    if (!formData.full_name) return showError('Full name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return showError('Please enter a valid email address');
    }
    if (!formData.phone || formData.phone.length < 8) {
      return showError('Please enter a valid phone number');
    }
    if (isNaN(formData.ticket_quantity) || formData.ticket_quantity < 1) {
      return showError('Ticket quantity must be at least 1');
    }

    // 提交注册
    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');

      // 注册成功
      successEl.textContent = result.message;
      successEl.style.display = 'block';
      form.reset();
      
      // 3秒后跳转到事件详情页
      setTimeout(() => {
        window.location.href = `event-detail.html?id=${eventId}`;
      }, 3000);

    } catch (err) {
      showError(err.message);
      console.error('注册失败：', err);
    }
  });
});

// 加载事件信息
async function loadEventInfo(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    if (!response.ok) throw new Error('Failed to load event information');

    const event = await response.json();
    
    // 填充事件信息
    document.getElementById('eventName').textContent = event.name;
    document.getElementById('eventDate').textContent = formatDate(event.date);
    document.getElementById('eventLocation').textContent = event.location;
    document.getElementById('eventCategory').textContent = event.category_name;
    document.getElementById('eventTicketPrice').textContent = event.ticket_price == 0 
      ? 'Free' 
      : `$${Number(event.ticket_price).toFixed(2)}`;
    document.getElementById('eventGoal').textContent = `$${Number(event.goal_amount).toFixed(2)}`;

  } catch (err) {
    showError('Failed to load event information');
    console.error('加载事件信息失败：', err);
  }
}

// 显示错误信息
function showError(message) {
  const errorEl = document.getElementById('registerError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

// 格式化日期
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-AU', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
