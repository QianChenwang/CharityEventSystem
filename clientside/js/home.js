const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.getElementById('upcomingEvents');
  const errorElement = document.getElementById('homeError');
  errorElement.style.display = 'none';

  try {
    const response = await fetch(`${API_BASE_URL}/api/events/upcoming`);
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

    const events = await response.json();
    eventsContainer.innerHTML = '';

    if (events.length === 0) {
      eventsContainer.innerHTML = '<p>No upcoming charity events at the moment. Check back soon!</p>';
      return;
    }

    events.forEach(event => {
      // 1. 创建事件卡片容器
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card card';

      // 2. 纯DOM创建图片元素（关键：避免字符串拼接）
      const eventImg = document.createElement('img');
      const thumbImage = `event-${event.id}.jpg`;
      // 设置图片属性（按规范顺序）
      eventImg.src = `images/${thumbImage}`;
      eventImg.alt = event.name; // 清晰的alt描述
      // 设置样式（通过style属性，而非内联字符串）
      eventImg.style.width = '100%';
      eventImg.style.height = '180px';
      eventImg.style.objectFit = 'cover';
      eventImg.style.borderRadius = '8px';
      eventImg.style.marginBottom = '1rem';
      // 设置onerror逻辑（通过DOM事件，而非内联属性）
      eventImg.onerror = function() {
        this.src = 'https://via.placeholder.com/400x250?text=Charity+Event';
        this.style.objectFit = 'contain'; // 占位图适配
      };
      // 将图片添加到卡片
      eventCard.appendChild(eventImg);

      // 3. 创建Upcoming状态标签
      const statusLabel = document.createElement('span');
      statusLabel.style.backgroundColor = '#27ae60';
      statusLabel.style.color = 'white';
      statusLabel.style.padding = '0.3rem 0.8rem';
      statusLabel.style.borderRadius = '20px';
      statusLabel.style.fontSize = '0.8rem';
      statusLabel.style.marginBottom = '0.5rem';
      statusLabel.style.display = 'inline-block';
      statusLabel.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Upcoming';
      eventCard.appendChild(statusLabel);

      // 4. 创建类别标签
      const categorySpan = document.createElement('span');
      categorySpan.className = 'category';
      categorySpan.textContent = event.category_name;
      eventCard.appendChild(categorySpan);

      // 5. 创建事件名称
      const eventName = document.createElement('h3');
      eventName.textContent = event.name;
      eventCard.appendChild(eventName);

      // 6. 创建日期信息
      const formattedDate = new Date(event.date).toLocaleString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const datePara = document.createElement('p');
      datePara.className = 'date';
      datePara.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formattedDate}`;
      eventCard.appendChild(datePara);

      // 7. 创建地点信息
      const locationPara = document.createElement('p');
      locationPara.className = 'location';
      locationPara.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${event.location}`;
      eventCard.appendChild(locationPara);

      // 8. 创建门票价格
      const pricePara = document.createElement('p');
      pricePara.className = 'price';
      const ticketPrice = event.ticket_price === 0 
        ? '<i class="fa-solid fa-ticket"></i> Free Entry (Donations Encouraged)' 
        : `<i class="fa-solid fa-ticket"></i> $${Number(event.ticket_price).toFixed(2)} per ticket`;
      pricePara.innerHTML = ticketPrice;
      eventCard.appendChild(pricePara);

      // 9. 创建筹款进度条
      const progressDiv = document.createElement('div');
      progressDiv.className = 'progress';
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.width = '0%';
      progressDiv.appendChild(progressFill);
      eventCard.appendChild(progressDiv);

      // 10. 创建进度文本
      const progressTextDiv = document.createElement('div');
      progressTextDiv.className = 'progress-text';
      const currentAmountSpan = document.createElement('span');
      currentAmountSpan.textContent = `Raised: $${Number(event.current_amount).toFixed(2)}`;
      const goalAmountSpan = document.createElement('span');
      goalAmountSpan.textContent = `Goal: $${Number(event.goal_amount).toFixed(2)}`;
      progressTextDiv.appendChild(currentAmountSpan);
      progressTextDiv.appendChild(goalAmountSpan);
      eventCard.appendChild(progressTextDiv);

      // 11. 创建详情页链接
      const detailLink = document.createElement('a');
      detailLink.className = 'view-details';
      detailLink.href = `event-detail.html?id=${event.id}`;
      detailLink.innerHTML = 'View Details <i class="fa-solid fa-arrow-right"></i>';
      eventCard.appendChild(detailLink);

      // 12. 进度条动画
      const progressPercentage = Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100);
      setTimeout(() => {
        progressFill.style.width = `${progressPercentage}%`;
      }, 300);

      // 13. 将卡片添加到容器
      eventsContainer.appendChild(eventCard);
    });

  } catch (err) {
    errorElement.textContent = `Failed to load events: ${err.message}. Please ensure the API server is running (http://localhost:3000).`;
    errorElement.style.display = 'block';
    eventsContainer.innerHTML = '';
    console.error('Home page error:', err);
  }
});