// 统一API地址（修复：原地址没有/api，导致请求错误）
const API_BASE_URL = 'http://localhost:3000/api';
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const categorySelect = document.getElementById('eventCategory');
  const resultsContainer = document.getElementById('searchResults');
  const errorElement = document.getElementById('searchError');
  errorElement.style.display = 'none';

  // 修复：后端暂无 /categories 接口，先注释加载分类逻辑（避免报错）
  // loadCategories(); 

  // 初始化搜索结果提示
  resultsContainer.innerHTML = '<p>Please enter search criteria and click "Search Events" to find relevant charity events.</p>';

  // 搜索表单提交（修复：请求后端存在的 /events 接口，而非不存在的 /events/search）
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = '<div class="loading">Searching for events...</div>';
    await performSearch();
  });

  // 清除筛选
  clearFiltersBtn.addEventListener('click', () => {
    searchForm.reset();
    resultsContainer.innerHTML = '<p>Please enter search criteria and click "Search Events" to find relevant charity events.</p>';
    errorElement.style.display = 'none';
  });

  // -------------------------- 核心函数 --------------------------
  // 暂不加载分类（后端暂无 /categories 接口，如需使用需先在后端新增）
  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`); // 后端需新增该接口
      if (!response.ok) throw new Error('Failed to load categories');
      const categories = await response.json();
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (err) {
      errorElement.textContent = `Categories not available (API not found). Search by date/location instead.`;
      errorElement.style.display = 'block';
      console.error('Load categories error:', err);
    }
  }

  // 执行搜索（修复：请求所有事件后前端筛选，而非不存在的 /events/search）
  async function performSearch() {
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const categoryId = document.getElementById('eventCategory').value;

    try {
      // 1. 请求所有事件
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
      let results = await response.json();

      // 2. 前端筛选（按日期、地点、分类）
      if (date) {
        // 筛选“日期匹配”的事件（精确到天）
        const targetDate = new Date(date).toDateString();
        results = results.filter(event => new Date(event.date).toDateString() === targetDate);
      }
      if (location) {
        // 筛选“地点包含关键词”的事件（不区分大小写）
        results = results.filter(event => 
          event.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      if (categoryId) {
        // 筛选“分类ID匹配”的事件
        results = results.filter(event => event.category_id == categoryId);
      }

      // 3. 渲染筛选结果
      renderSearchResults(results);
    } catch (err) {
      errorElement.textContent = `Search error: ${err.message}. Please ensure the API server is running.`;
      errorElement.style.display = 'block';
      resultsContainer.innerHTML = '';
      console.error('Search error:', err);
    }
  }

  // 渲染搜索结果（逻辑不变）
  function renderSearchResults(results) {
    resultsContainer.innerHTML = '';
    errorElement.style.display = 'none';
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No events found matching your criteria. Try adjusting your filters (e.g., remove the date or location)!</p>';
      return;
    }

    results.forEach(event => {
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
      // 图片加载失败占位
      eventImg.onerror = function() {
        this.src = 'https://via.placeholder.com/400x250?text=Charity+Event';
        this.style.objectFit = 'contain';
      };
      eventCard.appendChild(eventImg);

      // 状态标签（Upcoming/Past）
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

      // 添加卡片到结果容器
      resultsContainer.appendChild(eventCard);
    });
  }
});
