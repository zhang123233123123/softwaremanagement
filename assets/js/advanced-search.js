// 高级搜索和过滤系统

class AdvancedSearchManager {
    constructor() {
        this.searchHistory = this.loadSearchHistory();
        this.savedFilters = this.loadSavedFilters();
        this.init();
    }

    init() {
        this.createAdvancedSearchModal();
        this.setupEventListeners();
        this.initializeSearchSuggestions();
    }

    // 创建高级搜索模态框
    createAdvancedSearchModal() {
        const modalHTML = `
            <div class="modal" id="advancedSearchModal">
                <div class="modal-content advanced-search-content">
                    <span class="close" id="closeAdvancedSearch">&times;</span>
                    <div class="modal-body">
                        <h2><i class="fas fa-search"></i> 高级搜索</h2>
                        
                        <div class="search-tabs">
                            <button class="search-tab active" data-tab="filters">筛选条件</button>
                            <button class="search-tab" data-tab="history">搜索历史</button>
                            <button class="search-tab" data-tab="saved">保存的筛选</button>
                        </div>

                        <div class="search-tab-content" id="filtersTab">
                            <div class="search-section">
                                <h3>基本搜索</h3>
                                <div class="search-field">
                                    <label>关键词</label>
                                    <input type="text" id="advancedKeyword" placeholder="软件名称、描述、标签...">
                                    <div class="search-suggestions" id="searchSuggestions"></div>
                                </div>
                            </div>

                            <div class="search-section">
                                <h3>平台筛选</h3>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="windows" class="platform-filter"> Windows</label>
                                    <label><input type="checkbox" value="macos" class="platform-filter"> macOS</label>
                                    <label><input type="checkbox" value="linux" class="platform-filter"> Linux</label>
                                    <label><input type="checkbox" value="mobile" class="platform-filter"> 移动端</label>
                                </div>
                            </div>

                            <div class="search-section">
                                <h3>软件分类</h3>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="development" class="category-filter"> 开发工具</label>
                                    <label><input type="checkbox" value="browser" class="category-filter"> 浏览器</label>
                                    <label><input type="checkbox" value="media" class="category-filter"> 多媒体</label>
                                    <label><input type="checkbox" value="office" class="category-filter"> 办公软件</label>
                                    <label><input type="checkbox" value="game" class="category-filter"> 游戏</label>
                                    <label><input type="checkbox" value="utility" class="category-filter"> 实用工具</label>
                                </div>
                            </div>

                            <div class="search-section">
                                <h3>评分筛选</h3>
                                <div class="rating-filter">
                                    <label>最低评分</label>
                                    <div class="rating-slider">
                                        <input type="range" id="minRating" min="0" max="5" step="0.5" value="0">
                                        <div class="rating-display">
                                            <span id="minRatingDisplay">0</span> 星及以上
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="search-section">
                                <h3>文件大小</h3>
                                <div class="size-filter">
                                    <select id="sizeFilter">
                                        <option value="">不限制</option>
                                        <option value="small">小于 50MB</option>
                                        <option value="medium">50MB - 500MB</option>
                                        <option value="large">500MB - 2GB</option>
                                        <option value="xlarge">大于 2GB</option>
                                    </select>
                                </div>
                            </div>

                            <div class="search-section">
                                <h3>更新时间</h3>
                                <div class="date-filter">
                                    <select id="dateFilter">
                                        <option value="">不限制</option>
                                        <option value="week">最近一周</option>
                                        <option value="month">最近一月</option>
                                        <option value="quarter">最近三月</option>
                                        <option value="year">最近一年</option>
                                    </select>
                                </div>
                            </div>

                            <div class="search-section">
                                <h3>排序方式</h3>
                                <div class="sort-options">
                                    <select id="sortBy">
                                        <option value="relevance">相关性</option>
                                        <option value="rating">评分</option>
                                        <option value="downloads">下载量</option>
                                        <option value="name">名称</option>
                                        <option value="date">更新时间</option>
                                        <option value="size">文件大小</option>
                                    </select>
                                    <select id="sortOrder">
                                        <option value="desc">降序</option>
                                        <option value="asc">升序</option>
                                    </select>
                                </div>
                            </div>

                            <div class="search-actions">
                                <button type="button" id="resetFilters" class="btn-secondary">重置</button>
                                <button type="button" id="saveFilters" class="btn-outline">保存筛选</button>
                                <button type="button" id="applySearch" class="btn-primary">搜索</button>
                            </div>
                        </div>

                        <div class="search-tab-content" id="historyTab" style="display: none;">
                            <div class="search-history">
                                <div class="history-header">
                                    <h3>搜索历史</h3>
                                    <button id="clearHistory" class="btn-text">清空历史</button>
                                </div>
                                <div class="history-list" id="historyList">
                                    <!-- 搜索历史将动态填充 -->
                                </div>
                            </div>
                        </div>

                        <div class="search-tab-content" id="savedTab" style="display: none;">
                            <div class="saved-filters">
                                <div class="saved-header">
                                    <h3>保存的筛选</h3>
                                </div>
                                <div class="saved-list" id="savedList">
                                    <!-- 保存的筛选将动态填充 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 模态框控制
        document.getElementById('closeAdvancedSearch').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('advancedSearchModal').addEventListener('click', (e) => {
            if (e.target.id === 'advancedSearchModal') {
                this.closeModal();
            }
        });

        // 标签页切换
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // 评分滑块
        document.getElementById('minRating').addEventListener('input', (e) => {
            document.getElementById('minRatingDisplay').textContent = e.target.value;
        });

        // 搜索建议
        document.getElementById('advancedKeyword').addEventListener('input', (e) => {
            this.showSearchSuggestions(e.target.value);
        });

        // 按钮事件
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        document.getElementById('saveFilters').addEventListener('click', () => {
            this.saveCurrentFilters();
        });

        document.getElementById('applySearch').addEventListener('click', () => {
            this.applyAdvancedSearch();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearSearchHistory();
        });

        // 添加高级搜索按钮到主搜索框
        this.addAdvancedSearchButton();
    }

    // 添加高级搜索按钮
    addAdvancedSearchButton() {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            const advancedBtn = document.createElement('button');
            advancedBtn.className = 'advanced-search-btn';
            advancedBtn.innerHTML = '<i class="fas fa-filter"></i>';
            advancedBtn.title = '高级搜索';
            advancedBtn.addEventListener('click', () => this.showModal());
            searchBox.appendChild(advancedBtn);
        }
    }

    // 初始化搜索建议
    initializeSearchSuggestions() {
        this.suggestions = this.generateSuggestions();
    }

    // 生成搜索建议
    generateSuggestions() {
        const suggestions = new Set();
        
        softwareData.forEach(software => {
            // 添加软件名称
            suggestions.add(software.name);
            
            // 添加标签
            if (software.tags) {
                software.tags.forEach(tag => suggestions.add(tag));
            }
            
            // 添加分类
            if (software.category) {
                suggestions.add(software.category);
            }
        });

        return Array.from(suggestions).sort();
    }

    // 显示搜索建议
    showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (!query.trim()) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const filteredSuggestions = this.suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (filteredSuggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = filteredSuggestions.map(suggestion => 
            `<div class="suggestion-item" onclick="advancedSearchManager.selectSuggestion('${suggestion}')">${suggestion}</div>`
        ).join('');
        
        suggestionsContainer.style.display = 'block';
    }

    // 选择搜索建议
    selectSuggestion(suggestion) {
        document.getElementById('advancedKeyword').value = suggestion;
        document.getElementById('searchSuggestions').style.display = 'none';
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 显示对应内容
        document.querySelectorAll('.search-tab-content').forEach(content => {
            content.style.display = content.id === `${tabName}Tab` ? 'block' : 'none';
        });

        // 加载对应数据
        if (tabName === 'history') {
            this.renderSearchHistory();
        } else if (tabName === 'saved') {
            this.renderSavedFilters();
        }
    }

    // 应用高级搜索
    applyAdvancedSearch() {
        const filters = this.getCurrentFilters();
        const results = this.performAdvancedSearch(filters);
        
        // 保存搜索历史
        this.saveSearchHistory(filters);
        
        // 关闭模态框
        this.closeModal();
        
        // 更新主页显示
        this.displaySearchResults(results, filters);
        
        // 显示搜索结果统计
        this.showSearchStats(results, filters);
    }

    // 获取当前筛选条件
    getCurrentFilters() {
        return {
            keyword: document.getElementById('advancedKeyword').value.trim(),
            platforms: Array.from(document.querySelectorAll('.platform-filter:checked')).map(cb => cb.value),
            categories: Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value),
            minRating: parseFloat(document.getElementById('minRating').value),
            sizeFilter: document.getElementById('sizeFilter').value,
            dateFilter: document.getElementById('dateFilter').value,
            sortBy: document.getElementById('sortBy').value,
            sortOrder: document.getElementById('sortOrder').value
        };
    }

    // 执行高级搜索
    performAdvancedSearch(filters) {
        let results = [...softwareData];

        // 关键词搜索
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            results = results.filter(software => 
                software.name.toLowerCase().includes(keyword) ||
                software.description.toLowerCase().includes(keyword) ||
                (software.tags && software.tags.some(tag => tag.toLowerCase().includes(keyword)))
            );
        }

        // 平台筛选
        if (filters.platforms.length > 0) {
            results = results.filter(software => filters.platforms.includes(software.platform));
        }

        // 分类筛选
        if (filters.categories.length > 0) {
            results = results.filter(software => 
                software.category && filters.categories.includes(software.category)
            );
        }

        // 评分筛选
        if (filters.minRating > 0) {
            results = results.filter(software => 
                software.rating && software.rating >= filters.minRating
            );
        }

        // 文件大小筛选
        if (filters.sizeFilter) {
            results = results.filter(software => this.matchesSizeFilter(software.size, filters.sizeFilter));
        }

        // 更新时间筛选
        if (filters.dateFilter) {
            results = results.filter(software => this.matchesDateFilter(software.lastUpdated, filters.dateFilter));
        }

        // 排序
        results = this.sortResults(results, filters.sortBy, filters.sortOrder);

        return results;
    }

    // 文件大小匹配
    matchesSizeFilter(size, filter) {
        const sizeInMB = this.parseSizeToMB(size);
        
        switch (filter) {
            case 'small': return sizeInMB < 50;
            case 'medium': return sizeInMB >= 50 && sizeInMB <= 500;
            case 'large': return sizeInMB > 500 && sizeInMB <= 2048;
            case 'xlarge': return sizeInMB > 2048;
            default: return true;
        }
    }

    // 解析文件大小到MB
    parseSizeToMB(sizeString) {
        const match = sizeString.match(/(\d+\.?\d*)\s*(KB|MB|GB)/i);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        switch (unit) {
            case 'kb': return value / 1024;
            case 'mb': return value;
            case 'gb': return value * 1024;
            default: return value;
        }
    }

    // 日期匹配
    matchesDateFilter(dateString, filter) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        switch (filter) {
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case 'quarter': return diffDays <= 90;
            case 'year': return diffDays <= 365;
            default: return true;
        }
    }

    // 排序结果
    sortResults(results, sortBy, sortOrder) {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        
        return results.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return multiplier * a.name.localeCompare(b.name);
                case 'rating':
                    return multiplier * ((a.rating || 0) - (b.rating || 0));
                case 'downloads':
                    return multiplier * (a.downloads - b.downloads);
                case 'date':
                    return multiplier * (new Date(a.lastUpdated || 0) - new Date(b.lastUpdated || 0));
                case 'size':
                    return multiplier * (this.parseSizeToMB(a.size) - this.parseSizeToMB(b.size));
                default:
                    return 0;
            }
        });
    }

    // 显示搜索结果
    displaySearchResults(results, filters) {
        // 更新过滤按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        
        // 渲染搜索结果
        renderSoftware(results);
        
        // 滚动到结果区域
        document.getElementById('software-list').scrollIntoView({ behavior: 'smooth' });
    }

    // 显示搜索统计
    showSearchStats(results, filters) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'search-stats';
        statsDiv.innerHTML = `
            <div class="stats-content">
                <i class="fas fa-search"></i>
                找到 <strong>${results.length}</strong> 个软件
                ${filters.keyword ? `包含 "<em>${filters.keyword}</em>"` : ''}
                <button class="clear-search" onclick="advancedSearchManager.clearSearch()">
                    <i class="fas fa-times"></i> 清除搜索
                </button>
            </div>
        `;
        
        // 移除之前的统计信息
        const existingStats = document.querySelector('.search-stats');
        if (existingStats) {
            existingStats.remove();
        }
        
        // 插入新的统计信息
        const container = document.querySelector('.container');
        const showcaseSection = document.getElementById('software-list');
        container.insertBefore(statsDiv, showcaseSection);
    }

    // 清除搜索
    clearSearch() {
        document.querySelector('.search-stats')?.remove();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        filterSoftware(activeFilter);
    }

    // 重置筛选条件
    resetFilters() {
        document.getElementById('advancedKeyword').value = '';
        document.querySelectorAll('.platform-filter, .category-filter').forEach(cb => cb.checked = false);
        document.getElementById('minRating').value = 0;
        document.getElementById('minRatingDisplay').textContent = '0';
        document.getElementById('sizeFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('sortBy').value = 'relevance';
        document.getElementById('sortOrder').value = 'desc';
    }

    // 保存当前筛选条件
    saveCurrentFilters() {
        const filters = this.getCurrentFilters();
        const name = prompt('请输入筛选条件名称:');
        
        if (name && name.trim()) {
            const savedFilter = {
                id: Date.now(),
                name: name.trim(),
                filters: filters,
                createdAt: new Date().toISOString()
            };
            
            this.savedFilters.push(savedFilter);
            this.saveSavedFilters();
            this.showNotification('筛选条件已保存', 'success');
        }
    }

    // 保存搜索历史
    saveSearchHistory(filters) {
        const historyItem = {
            id: Date.now(),
            filters: filters,
            timestamp: new Date().toISOString(),
            description: this.generateSearchDescription(filters)
        };
        
        this.searchHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveSearchHistory();
    }

    // 生成搜索描述
    generateSearchDescription(filters) {
        const parts = [];
        
        if (filters.keyword) parts.push(`"${filters.keyword}"`);
        if (filters.platforms.length > 0) parts.push(`平台: ${filters.platforms.join(', ')}`);
        if (filters.categories.length > 0) parts.push(`分类: ${filters.categories.join(', ')}`);
        if (filters.minRating > 0) parts.push(`${filters.minRating}星以上`);
        
        return parts.join(' | ') || '全部软件';
    }

    // 渲染搜索历史
    renderSearchHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.searchHistory.length === 0) {
            historyList.innerHTML = '<div class="empty-state">暂无搜索历史</div>';
            return;
        }
        
        historyList.innerHTML = this.searchHistory.map(item => `
            <div class="history-item">
                <div class="history-content" onclick="advancedSearchManager.applyHistoryItem(${item.id})">
                    <div class="history-description">${item.description}</div>
                    <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <button class="history-delete" onclick="advancedSearchManager.deleteHistoryItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // 渲染保存的筛选
    renderSavedFilters() {
        const savedList = document.getElementById('savedList');
        
        if (this.savedFilters.length === 0) {
            savedList.innerHTML = '<div class="empty-state">暂无保存的筛选条件</div>';
            return;
        }
        
        savedList.innerHTML = this.savedFilters.map(item => `
            <div class="saved-item">
                <div class="saved-content" onclick="advancedSearchManager.applySavedFilter(${item.id})">
                    <div class="saved-name">${item.name}</div>
                    <div class="saved-description">${this.generateSearchDescription(item.filters)}</div>
                    <div class="saved-time">保存于 ${new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <button class="saved-delete" onclick="advancedSearchManager.deleteSavedFilter(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // 应用历史搜索
    applyHistoryItem(id) {
        const item = this.searchHistory.find(h => h.id === id);
        if (item) {
            this.applyFilters(item.filters);
            this.closeModal();
        }
    }

    // 应用保存的筛选
    applySavedFilter(id) {
        const item = this.savedFilters.find(f => f.id === id);
        if (item) {
            this.applyFilters(item.filters);
            this.closeModal();
        }
    }

    // 应用筛选条件
    applyFilters(filters) {
        // 设置表单值
        document.getElementById('advancedKeyword').value = filters.keyword || '';
        
        document.querySelectorAll('.platform-filter').forEach(cb => {
            cb.checked = filters.platforms.includes(cb.value);
        });
        
        document.querySelectorAll('.category-filter').forEach(cb => {
            cb.checked = filters.categories.includes(cb.value);
        });
        
        document.getElementById('minRating').value = filters.minRating || 0;
        document.getElementById('minRatingDisplay').textContent = filters.minRating || 0;
        document.getElementById('sizeFilter').value = filters.sizeFilter || '';
        document.getElementById('dateFilter').value = filters.dateFilter || '';
        document.getElementById('sortBy').value = filters.sortBy || 'relevance';
        document.getElementById('sortOrder').value = filters.sortOrder || 'desc';
        
        // 执行搜索
        this.applyAdvancedSearch();
    }

    // 删除历史项目
    deleteHistoryItem(id) {
        this.searchHistory = this.searchHistory.filter(item => item.id !== id);
        this.saveSearchHistory();
        this.renderSearchHistory();
    }

    // 删除保存的筛选
    deleteSavedFilter(id) {
        this.savedFilters = this.savedFilters.filter(item => item.id !== id);
        this.saveSavedFilters();
        this.renderSavedFilters();
    }

    // 清空搜索历史
    clearSearchHistory() {
        if (confirm('确定要清空所有搜索历史吗？')) {
            this.searchHistory = [];
            localStorage.removeItem('search_history');
            this.renderSearchHistory();
        }
    }

    // 显示模态框
    showModal() {
        document.getElementById('advancedSearchModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('advancedSearchModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // 存储管理
    loadSearchHistory() {
        const saved = localStorage.getItem('search_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveSearchHistory() {
        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }

    loadSavedFilters() {
        const saved = localStorage.getItem('saved_filters');
        return saved ? JSON.parse(saved) : [];
    }

    saveSavedFilters() {
        localStorage.setItem('saved_filters', JSON.stringify(this.savedFilters));
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化高级搜索管理器
let advancedSearchManager;
document.addEventListener('DOMContentLoaded', function() {
    advancedSearchManager = new AdvancedSearchManager();
});