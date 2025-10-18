const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const categorySelect = document.getElementById('eventCategory');
  const resultsContainer = document.getElementById('searchResults');
  const errorElement = document.getElementById('searchError');
  errorElement.style.display = 'none';

  loadCategories();

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<div class="loading">Searching for events...</div>';
    await performSearch();
  });

  clearFiltersBtn.addEventListener('click', () => {
    searchForm.reset();
    resultsContainer.innerHTML = '<p>Please enter search criteria and click "Search Events" to find relevant charity events.</p>';
    errorElement.style.display = 'none';
  });

  // -------------------------- 核心函数 --------------------------
  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error('Failed to load categories');

      const categories = await response.json();
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });

    } catch (err) {
      errorElement.textContent = `Error loading categories: ${err.message}. Please check the API server.`;
      errorElement.style.display = 'block';
      console.error('Load categories error:', err);
    }
  }

  async function performSearch() {
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const categoryId = document.getElementById('eventCategory').value;

    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    if (location) queryParams.append('location', location);
    if (categoryId) queryParams.append('categoryId', categoryId);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const searchUrl = `${API_BASE_URL}/api/events/search${queryString}`;

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);

      const results = await response.json();
      renderSearchResults(results);

    } catch (err) {
      errorElement.textContent = `Search error: ${err.message}. Please ensure the API server is running and try again.`;
      errorElement.style.display = 'block';
      resultsContainer.innerHTML = '';
      console.error('Search error:', err);
    }
  }

  function renderSearchResults(results) {
    resultsContainer.innerHTML = '';
    errorElement.style.display = 'none';

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No events found matching your criteria. Try adjusting your filters (e.g., remove the date or location)!</p>';
      return;
    }

    results.forEach(event => {
      // 1. 创建事件卡片容器
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card card';

      // 2. 纯DOM创建图片（无字符串拼接）
      const eventImg = document.createElement('img');
      const thumbImage = `event-${event.id}.jpg`;
      eventImg.src = `images/${thumbImage}`;
      eventImg.alt = event.name;
      eventImg.style.width = '100%';
      eventImg.style.height = '180px';
      eventImg.style.objectFit = 'cover';
      eventImg.style.borderRadius = '8px';
      eventImg.style.marginBottom = '1rem';
      // onerror逻辑（DOM事件）
      eventImg.onerror = function() {
        this.src = 'https://via.placeholder.com/400x250?text=Charity+Event';
        this.style.objectFit = 'contain';
      };
      eventCard.appendChild(eventImg);

      // 3. 创建事件状态标签（Upcoming/Past）
      const statusLabel = document.createElement('span');
      const isUpcoming = new Date(event.date) > new Date();
      if (isUpcoming) {
        statusLabel.style.backgroundColor = '#27ae60';
        statusLabel.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Upcoming';
      } else {
        statusLabel.style.backgroundColor = '#7f8c8d';
        statusLabel.innerHTML = '<i class="fa-solid fa-calendar-xmark"></i> Past';
      }
      statusLabel.style.color = 'white';
      statusLabel.style.padding = '0.3rem 0.8rem';
      statusLabel.style.borderRadius = '20px';
      statusLabel.style.fontSize = '0.8rem';
      statusLabel.style.marginBottom = '0.5rem';
      statusLabel.style.display = 'inline-block';
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

      // 13. 添加卡片到结果容器
      resultsContainer.appendChild(eventCard);
    });
  }
});