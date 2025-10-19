// 统一API地址（和其他文件保持一致，带/api）
const API_BASE_URL = 'http://localhost:3000/api';
document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.getElementById('upcomingEvents');
  const errorElement = document.getElementById('homeError');
  errorElement.style.display = 'none';
  try {
    // 修复：请求后端存在的 /events 接口（去掉不存在的 /upcoming）
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    
    const allEvents = await response.json();
    // 前端筛选“即将到来的事件”（日期 > 当前时间）
    const events = allEvents.filter(event => new Date(event.date) > new Date());

    eventsContainer.innerHTML = '';
    if (events.length === 0) {
      eventsContainer.innerHTML = '<p>No upcoming charity events at the moment. Check back soon!</p>';
      return;
    }

    // 以下渲染事件卡片的逻辑不变（保留原功能）
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card card';

      // 事件图片
      const eventImg = document.createElement('img');
      const thumbImage = `event-${event.id}.jpg`;
      eventImg.src = `images/${thumbImage}`;
      eventImg.alt = event.name;
      eventImg.style.width = '100%';
      eventImg.style.height = '180px';
      eventImg.style.objectFit = 'cover';
      eventImg.style.borderRadius = '8px';
      eventImg.style.marginBottom = '1rem';
      // 图片加载失败时显示占位图
      eventImg.onerror = function() {
        this.src = 'https://via.placeholder.com/400x250?text=Charity+Event';
        this.style.objectFit = 'contain';
      };
      eventCard.appendChild(eventImg);

      // 状态标签（Upcoming）
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

      // 类别标签
      const categorySpan = document.createElement('span');
      categorySpan.className = 'category';
      categorySpan.textContent = event.category_name;
      eventCard.appendChild(categorySpan);

      // 事件名称
      const eventName = document.createElement('h3');
      eventName.textContent = event.name;
      eventCard.appendChild(eventName);

      // 日期信息
      const formattedDate = new Date(event.date).toLocaleString('en-AU', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const datePara = document.createElement('p');
      datePara.className = 'date';
      datePara.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formattedDate}`;
      eventCard.appendChild(datePara);

      // 地点信息
      const locationPara = document.createElement('p');
      locationPara.className = 'location';
      locationPara.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${event.location}`;
      eventCard.appendChild(locationPara);

      // 门票价格
      const pricePara = document.createElement('p');
      pricePara.className = 'price';
      const ticketPrice = event.ticket_price === 0 
        ? '<i class="fa-solid fa-ticket"></i> Free Entry (Donations Encouraged)' 
        : `<i class="fa-solid fa-ticket"></i> $${Number(event.ticket_price).toFixed(2)} per ticket`;
      pricePara.innerHTML = ticketPrice;
      eventCard.appendChild(pricePara);

      // 筹款进度条
      const progressDiv = document.createElement('div');
      progressDiv.className = 'progress';
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.width = '0%';
      progressDiv.appendChild(progressFill);
      eventCard.appendChild(progressDiv);

      // 进度文本
      const progressTextDiv = document.createElement('div');
      progressTextDiv.className = 'progress-text';
      const currentAmountSpan = document.createElement('span');
      currentAmountSpan.textContent = `Raised: $${Number(event.current_amount).toFixed(2)}`;
      const goalAmountSpan = document.createElement('span');
      goalAmountSpan.textContent = `Goal: $${Number(event.goal_amount).toFixed(2)}`;
      progressTextDiv.appendChild(currentAmountSpan);
      progressTextDiv.appendChild(goalAmountSpan);
      eventCard.appendChild(progressTextDiv);

      // 详情页链接
      const detailLink = document.createElement('a');
      detailLink.className = 'view-details';
      detailLink.href = `event-detail.html?id=${event.id}`;
      detailLink.innerHTML = 'View Details <i class="fa-solid fa-arrow-right"></i>';
      eventCard.appendChild(detailLink);

      // 进度条动画
      const progressPercentage = Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100);
      setTimeout(() => {
        progressFill.style.width = `${progressPercentage}%`;
      }, 300);

      // 添加卡片到容器
      eventsContainer.appendChild(eventCard);
    });
  } catch (err) {
    errorElement.textContent = `Failed to load events: ${err.message}. Please ensure the API server is running (${API_BASE_URL}).`;
    errorElement.style.display = 'block';
    eventsContainer.innerHTML = '';
    console.error('Home page error:', err);
  }
});
