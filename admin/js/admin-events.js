const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.getElementById('eventsContainer');
  const errorElement = document.getElementById('adminError');
  errorElement.style.display = 'none';

  try {
    // 获取所有事件（含暂停的8个）
    const response = await fetch(`${API_BASE_URL}/admin/events`);
    if (!response.ok) throw new Error(`Failed to load events: ${response.statusText}`);
    const events = await response.json();

    eventsContainer.innerHTML = '';
    if (events.length === 0) {
      eventsContainer.innerHTML = '<p>No events found. Add your first event!</p>';
      return;
    }

    // 渲染所有事件（含状态标签）
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card card';

      // 状态标签（Active/Suspended/Past）
      const statusLabel = document.createElement('span');
      if (event.is_suspended) {
        statusLabel.style.backgroundColor = '#e74c3c';
        statusLabel.textContent = 'Suspended';
      } else if (new Date(event.date) < new Date()) {
        statusLabel.style.backgroundColor = '#7f8c8d';
        statusLabel.textContent = 'Past';
      } else {
        statusLabel.style.backgroundColor = '#27ae60';
        statusLabel.textContent = 'Active';
      }
      statusLabel.style.color = 'white';
      statusLabel.style.padding = '0.3rem 0.8rem';
      statusLabel.style.borderRadius = '20px';
      statusLabel.style.fontSize = '0.8rem';
      statusLabel.style.display = 'inline-block';
      eventCard.appendChild(statusLabel);

      // 事件名称
      const eventName = document.createElement('h3');
      eventName.textContent = event.name;
      eventCard.appendChild(eventName);

      // 日期和地点
      const datePara = document.createElement('p');
      datePara.innerHTML = `<i class="fa-regular fa-calendar"></i> ${new Date(event.date).toLocaleString()}`;
      eventCard.appendChild(datePara);

      const locationPara = document.createElement('p');
      locationPara.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${event.location}`;
      eventCard.appendChild(locationPara);

      // 操作按钮（编辑/删除）
      const actionDiv = document.createElement('div');
      actionDiv.className = 'action-buttons';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Edit';
      editBtn.addEventListener('click', () => {
        window.location.href = `admin-edit.html?id=${event.id}`;
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
          await deleteEvent(event.id);
        }
      });
      
      actionDiv.appendChild(editBtn);
      actionDiv.appendChild(deleteBtn);
      eventCard.appendChild(actionDiv);

      eventsContainer.appendChild(eventCard);
    });
  } catch (err) {
    errorElement.textContent = `Error: ${err.message}. Please check API server.`;
    errorElement.style.display = 'block';
    eventsContainer.innerHTML = '';
    console.error('Admin events error:', err);
  }
});

// 删除事件
async function deleteEvent(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Delete failed');
    
    // 删除成功后刷新页面
    window.location.reload();
  } catch (err) {
    alert(err.message); // 显示删除失败原因（如“有注册记录不能删除”）
    console.error('Delete error:', err);
  }
}