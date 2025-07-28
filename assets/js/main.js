// 软件数据配置 - 用户可以通过管理后台或手动添加软件
const softwareData = [
    {
        id: 1,
        name: "VideoPro+",
        description: "一个简洁高效的视频播放器应用，支持多种视频解析器，让您轻松观看各种视频内容。",
        platform: "mobile",
        icon: "fas fa-play-circle",
        version: "1.0.0",
        size: "16 MB",
        downloads: 0,
        downloadUrl: "software/mobile/videoproplus/VideoPro+.apk",
        screenshots: [],
        category: "media",
        tags: ["视频播放器", "Android", "解析器", "媒体"],
        rating: 4.8,
        lastUpdated: "2024-07-28"
    }
];

// DOM元素
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const softwareGrid = document.getElementById('softwareGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('softwareModal');
const closeModal = document.querySelector('.close');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateStats();
    renderSoftware(softwareData);
    setupEventListeners();
});

// 初始化应用
function initializeApp() {
    console.log('软件管理平台初始化完成');
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 移动端菜单切换
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 关闭移动端菜单
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // 过滤按钮
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // 更新活跃状态
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 过滤软件
            filterSoftware(filter);
        });
    });

    // 搜索功能
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // 平台卡片点击
    document.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.getAttribute('data-platform');
            filterSoftware(platform);
            
            // 滚动到软件展示区域
            document.getElementById('software-list').scrollIntoView({
                behavior: 'smooth'
            });
            
            // 更新过滤按钮状态
            filterBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === platform) {
                    btn.classList.add('active');
                }
            });
        });
    });

    // 模态框关闭
    closeModal.addEventListener('click', closeModalWindow);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalWindow();
        }
    });

    // 滚动效果
    window.addEventListener('scroll', handleScroll);
}

// 更新统计数据（将在README查看器中处理真实数据）
function updateStats() {
    const platformCounts = {
        windows: 0,
        macos: 0,
        linux: 0,
        mobile: 0
    };

    softwareData.forEach(software => {
        platformCounts[software.platform]++;
    });

    // 更新页面显示 - 软件数量使用真实数据
    document.getElementById('totalSoftware').textContent = softwareData.length + '+';
    
    // 平台计数使用真实数据
    document.getElementById('windowsCount').textContent = platformCounts.windows;
    document.getElementById('macosCount').textContent = platformCounts.macos;
    document.getElementById('linuxCount').textContent = platformCounts.linux;
    document.getElementById('mobileCount').textContent = platformCounts.mobile;
    
    // 总下载量将由readme-viewer.js中的真实统计系统处理
    // 这里不再使用软件数据中的假下载量
}

// 渲染软件卡片
function renderSoftware(software) {
    if (!softwareGrid) return;

    if (software.length === 0) {
        softwareGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <p>未找到相关软件</p>
            </div>
        `;
        return;
    }

    softwareGrid.innerHTML = software.map(app => `
        <div class="software-card" data-id="${app.id}">
            <div class="software-header">
                <div class="software-icon">
                    <i class="${app.icon}"></i>
                </div>
                <div class="software-info">
                    <h3>${app.name}</h3>
                    <p>${app.description}</p>
                    ${app.rating ? `<div class="rating">
                        ${'★'.repeat(Math.floor(app.rating))}${'☆'.repeat(5-Math.floor(app.rating))}
                        <span class="rating-score">${app.rating}</span>
                    </div>` : ''}
                </div>
            </div>
            <div class="software-meta">
                <span>版本: ${app.version}</span>
                <span>大小: ${app.size}</span>
                <span>下载: ${formatNumber(app.downloads)}</span>
            </div>
            ${app.tags ? `<div class="software-tags">
                ${app.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>` : ''}
            <div class="software-actions">
                <span class="platform-tag ${app.platform}">
                    ${getPlatformName(app.platform)}
                </span>
                <button class="download-btn" onclick="downloadSoftware('${app.downloadUrl}', '${app.name}')">
                    <i class="fas fa-download"></i>
                    下载
                </button>
            </div>
        </div>
    `).join('');

    // 添加卡片点击事件
    document.querySelectorAll('.software-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.download-btn')) {
                const id = parseInt(card.getAttribute('data-id'));
                // 优先显示README内容
                if (typeof showSoftwareReadme === 'function') {
                    showSoftwareReadme(id);
                } else {
                    showSoftwareModal(id);
                }
            }
        });
    });

    // 添加入场动画
    animateCards();
}

// 过滤软件
function filterSoftware(filter) {
    let filteredData = softwareData;
    
    if (filter !== 'all') {
        filteredData = softwareData.filter(app => app.platform === filter);
    }
    
    renderSoftware(filteredData);
}

// 搜索处理
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        renderSoftware(softwareData);
        return;
    }
    
    const filteredData = softwareData.filter(app => 
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        getPlatformName(app.platform).toLowerCase().includes(query)
    );
    
    renderSoftware(filteredData);
}

// 显示软件详情模态框
function showSoftwareModal(id) {
    const software = softwareData.find(app => app.id === id);
    if (!software) return;

    // 更新模态框内容
    document.getElementById('modalTitle').textContent = software.name;
    document.getElementById('modalDescription').textContent = software.description;
    document.getElementById('modalVersion').textContent = software.version;
    document.getElementById('modalSize').textContent = software.size;
    document.getElementById('modalDownloads').textContent = formatNumber(software.downloads);
    
    // 设置图标
    const modalIcon = document.getElementById('modalIcon');
    modalIcon.innerHTML = `<i class="${software.icon}" style="font-size: 4rem; color: var(--secondary-color);"></i>`;
    
    // 设置下载按钮
    const primaryDownload = document.getElementById('primaryDownload');
    primaryDownload.onclick = () => downloadSoftware(software.downloadUrl, software.name);
    
    // 显示截图
    const screenshotsContainer = document.getElementById('modalScreenshots');
    if (software.screenshots && software.screenshots.length > 0) {
        screenshotsContainer.innerHTML = software.screenshots.map(img => 
            `<img src="${img}" alt="${software.name} 截图" onerror="this.style.display='none'">`
        ).join('');
    } else {
        screenshotsContainer.style.display = 'none';
    }
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModalWindow() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 下载软件
function downloadSoftware(url, name) {
    // 找到对应的软件对象
    const software = softwareData.find(app => app.name === name);
    if (software && readmeViewer) {
        // 使用readmeViewer的下载方法进行统计跟踪
        readmeViewer.downloadSoftware(software);
    } else {
        // 如果找不到软件对象，直接下载
        proceedWithDirectDownload(url, name);
    }
}

// 直接下载（备用方法）
function proceedWithDirectDownload(url, name) {
    // 显示下载提示
    showNotification(`开始下载 ${name}`, 'success');
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = `https://github.com/zhang123233123123/softwaremanagement/raw/main/${url}`;
    link.download = name;
    link.target = '_blank';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 更新下载统计
    updateDownloadCount(name);
}

// 更新下载统计
function updateDownloadCount(name) {
    const software = softwareData.find(app => app.name === name);
    if (software) {
        software.downloads++;
        updateStats();
        
        // 重新渲染当前显示的软件
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        filterSoftware(activeFilter);
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--secondary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 滚动处理
function handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'var(--white)';
        navbar.style.backdropFilter = 'none';
    }
}

// 卡片动画
function animateCards() {
    const cards = document.querySelectorAll('.software-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getPlatformName(platform) {
    const names = {
        windows: 'Windows',
        macos: 'macOS',
        linux: 'Linux',
        mobile: '移动端'
    };
    return names[platform] || platform;
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-light);
    }
    
    .platform-tag {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .platform-tag.windows { background: #0078d4; color: white; }
    .platform-tag.macos { background: #007aff; color: white; }
    .platform-tag.linux { background: #f39c12; color: white; }
    .platform-tag.mobile { background: #27ae60; color: white; }
`;
document.head.appendChild(style);

// GitHub Pages 兼容性处理
if (window.location.hostname.includes('github.io')) {
    console.log('GitHub Pages 环境检测到，启用兼容模式');
    
    // 修改下载链接基础路径
    const baseUrl = 'https://raw.githubusercontent.com/zhang123233123123/softwaremanagement/main/';
    
    // 更新软件数据中的下载链接
    softwareData.forEach(software => {
        if (!software.downloadUrl.startsWith('http')) {
            software.downloadUrl = baseUrl + software.downloadUrl;
        }
    });
}