const API_BASE_URL = 'http://localhost:3000/api/admin';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addEventForm');
  const errorEl = document.getElementById('addError');
  const successEl = document.getElementById('addSuccess');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    // 收集表单数据
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

    // 提交到API
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add event');

      // 成功：提示+跳转
      successEl.textContent = 'Event added successfully!';
      successEl.style.display = 'block';
      form.reset();
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 2000);

    } catch (err) {
      errorEl.textContent = `Error: ${err.message}`;
      errorEl.style.display = 'block';
      console.error('Admin add event error:', err);
    }
  });
});
