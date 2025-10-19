const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addEventForm');
  const errorEl = document.getElementById('addError');
  const successEl = document.getElementById('addSuccess');
  
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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

    // 提交新增事件
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create event');

      // 成功提示
      successEl.textContent = `Event "${eventData.name}" created successfully!`;
      successEl.style.display = 'block';
      form.reset();

      // 3秒后跳转到事件列表
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 3000);
    } catch (err) {
      showError(err.message);
      console.error('Add event error:', err);
    }
  });
});

function showError(message) {
  const errorEl = document.getElementById('addError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}