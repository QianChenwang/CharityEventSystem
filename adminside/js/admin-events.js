const API_BASE_URL = 'http://localhost:3000/api/admin';  // 管理员API地址

document.addEventListener('DOMContentLoaded', async () => {
  await loadAllEvents();
});

// 加载所有事件（管理员用）
async function loadAllEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Failed to load events');
    const events = await response.json();

    const tableContainer = document.getElementById('eventsTableContainer');
    if (events.length === 0) {
      tableContainer.textContent = 'No events found. Add your first event!';
      return;
    }

    // 生成事件表格（含编辑/删除按钮）
    let tableHtml = `
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f1ede6;">
            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Event Name</th>
            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
            <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #ddd;">Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    events.forEach(event => {
      const isUpcoming = new Date(event.date) > new Date();
      const statusBadge = isUpcoming 
        ? `<span style="background: #27ae60; color:white; padding:0.3rem 0.6rem; border-radius: 15px; font-size:0.8rem;">Upcoming</span>`
        : `<span style="background: #7f8c8d; color:white; padding:0.3rem 0.6rem; border-radius: 15px; font-size:0.8rem;">Past</span>`;
      const suspendedBadge = event.is_suspended 
        ? `<span style="background: #e74c3c; color:white; padding:0.3rem 0.6rem; border-radius: 15px; font-size:0.8rem; margin-left:0.5rem;">Suspended</span>`
        : '';

      tableHtml += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 1rem;">${event.name}</td>
          <td style="padding: 1rem;">${new Date(event.date).toLocaleString('en-AU')}</td>
          <td style="padding: 1rem;">${event.location}</td>
          <td style="padding: 1rem;">$${Number(event.ticket_price).toFixed(2)}</td>
          <td style="padding: 1rem;">${statusBadge} ${suspendedBadge}</td>
          <td style="padding: 1rem; text-align: center;">
            <a href="admin-edit-event.html?id=${event.id}" class="btn btn-secondary" style="margin-right: 0.5rem;">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </a>
            <button class="btn btn-danger" onclick="deleteEvent(${event.id})">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    tableContainer.innerHTML = tableHtml;

  } catch (err) {
    document.getElementById('adminError').textContent = `Error: ${err.message}`;
    document.getElementById('adminError').style.display = 'block';
    console.error('Admin load events error:', err);
  }
}

// 删除事件（管理员用）
async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Delete failed');

    // 成功：刷新列表
    document.getElementById('adminSuccess').textContent = data.message;
    document.getElementById('adminSuccess').style.display = 'block';
    setTimeout(loadAllEvents, 1500);

  } catch (err) {
    document.getElementById('adminError').textContent = `Error: ${err.message}`;
    document.getElementById('adminError').style.display = 'block';
  }
}
