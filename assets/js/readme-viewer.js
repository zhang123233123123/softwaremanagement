// README内容查看器和统计系统

class ReadmeViewer {
    constructor() {
        this.statistics = this.loadStatistics();
        this.init();
    }

    init() {
        this.initializeStatistics();
        this.setupReadmeModal();
        this.trackPageView();
        this.createStatisticsWidget();
    }

    // 初始化统计系统
    initializeStatistics() {
        if (!this.statistics.pageViews) {
            this.statistics.pageViews = 0;
            this.statistics.totalDownloads = 0;
            this.statistics.softwareDownloads = {};
            this.statistics.visitHistory = [];
            this.statistics.startDate = new Date().toISOString();
        }
        this.saveStatistics();
    }

    // 跟踪页面访问
    trackPageView() {
        this.statistics.pageViews++;
        this.statistics.visitHistory.push({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href
        });

        // 限制历史记录数量
        if (this.statistics.visitHistory.length > 1000) {
            this.statistics.visitHistory = this.statistics.visitHistory.slice(-500);
        }

        this.saveStatistics();
        this.updateStatisticsWidget();
    }

    // 跟踪软件下载
    trackSoftwareDownload(softwareId, softwareName) {
        this.statistics.totalDownloads++;
        
        if (!this.statistics.softwareDownloads[softwareId]) {
            this.statistics.softwareDownloads[softwareId] = {
                name: softwareName,
                count: 0,
                history: []
            };
        }
        
        this.statistics.softwareDownloads[softwareId].count++;
        this.statistics.softwareDownloads[softwareId].history.push({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // 更新软件数据中的下载量
        const software = softwareData.find(app => app.id === softwareId);
        if (software) {
            software.downloads = this.statistics.softwareDownloads[softwareId].count;
        }

        this.saveStatistics();
        this.updateStatisticsWidget();
        
        // 显示下载通知
        this.showDownloadNotification(softwareName);
    }

    // 创建统计小部件
    createStatisticsWidget() {
        const widget = document.createElement('div');
        widget.className = 'stats-widget';
        widget.id = 'statisticsWidget';
        
        widget.innerHTML = `
            <h4><i class="fas fa-chart-bar"></i> 网站统计</h4>
            <div class="stats-item">
                <span>页面访问量:</span>
                <span id="pageViewsCount">${this.formatNumber(this.statistics.pageViews)}</span>
            </div>
            <div class="stats-item">
                <span>总下载量:</span>
                <span id="totalDownloadsCount">${this.formatNumber(this.statistics.totalDownloads)}</span>
            </div>
            <div class="stats-item">
                <span>在线时长:</span>
                <span id="onlineTime">0分钟</span>
            </div>
            <div class="stats-item">
                <span>今日访问:</span>
                <span id="todayViews">${this.getTodayViews()}</span>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // 添加点击事件显示详细统计
        widget.addEventListener('click', () => this.showDetailedStats());
        
        // 启动在线时长计时器
        this.startOnlineTimer();
    }

    // 更新统计小部件
    updateStatisticsWidget() {
        const pageViewsCount = document.getElementById('pageViewsCount');
        const totalDownloadsCount = document.getElementById('totalDownloadsCount');
        const todayViews = document.getElementById('todayViews');
        
        if (pageViewsCount) pageViewsCount.textContent = this.formatNumber(this.statistics.pageViews);
        if (totalDownloadsCount) totalDownloadsCount.textContent = this.formatNumber(this.statistics.totalDownloads);
        if (todayViews) todayViews.textContent = this.getTodayViews();
    }

    // 启动在线时长计时器
    startOnlineTimer() {
        let onlineMinutes = 0;
        const onlineTimer = document.getElementById('onlineTime');
        
        setInterval(() => {
            onlineMinutes++;
            if (onlineTimer) {
                if (onlineMinutes < 60) {
                    onlineTimer.textContent = `${onlineMinutes}分钟`;
                } else {
                    const hours = Math.floor(onlineMinutes / 60);
                    const minutes = onlineMinutes % 60;
                    onlineTimer.textContent = `${hours}小时${minutes}分钟`;
                }
            }
        }, 60000); // 每分钟更新一次
    }

    // 获取今日访问量
    getTodayViews() {
        const today = new Date().toDateString();
        return this.statistics.visitHistory.filter(visit => 
            new Date(visit.timestamp).toDateString() === today
        ).length;
    }

    // 设置README模态框
    setupReadmeModal() {
        const modalHTML = `
            <div class="modal readme-modal" id="readmeModal">
                <div class="modal-content readme-content">
                    <div class="readme-header">
                        <div class="readme-title">
                            <h2 id="readmeTitle">软件说明</h2>
                            <div class="readme-meta">
                                <span id="readmePlatform"></span>
                                <span id="readmeVersion"></span>
                                <span id="readmeSize"></span>
                            </div>
                        </div>
                        <button class="close-btn" id="closeReadme">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="readme-content-area">
                        <div class="readme-loading">
                            <div class="loading-spinner"></div>
                            <p>正在加载说明文档...</p>
                        </div>
                        <div class="readme-body" id="readmeBody"></div>
                    </div>
                    <div class="readme-actions">
                        <button class="action-btn secondary" id="downloadFromReadme">
                            <i class="fas fa-download"></i>
                            下载软件
                        </button>
                        <button class="action-btn secondary" id="viewVersions">
                            <i class="fas fa-history"></i>
                            版本历史
                        </button>
                        <button class="action-btn secondary" id="rateSoftware">
                            <i class="fas fa-star"></i>
                            评价软件
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 设置事件监听器
        document.getElementById('closeReadme').addEventListener('click', () => {
            this.closeReadmeModal();
        });
        
        document.getElementById('readmeModal').addEventListener('click', (e) => {
            if (e.target.id === 'readmeModal') {
                this.closeReadmeModal();
            }
        });
    }

    // 显示软件README
    async showReadme(softwareId) {
        const software = softwareData.find(app => app.id === softwareId);
        if (!software) return;

        // 显示模态框
        const modal = document.getElementById('readmeModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // 更新标题信息
        document.getElementById('readmeTitle').textContent = software.name;
        document.getElementById('readmePlatform').textContent = this.getPlatformName(software.platform);
        document.getElementById('readmeVersion').textContent = `v${software.version}`;
        document.getElementById('readmeSize').textContent = software.size;

        // 显示加载状态
        document.querySelector('.readme-loading').style.display = 'flex';
        document.getElementById('readmeBody').style.display = 'none';

        // 设置下载按钮
        document.getElementById('downloadFromReadme').onclick = () => {
            this.downloadSoftware(software);
            this.closeReadmeModal();
        };

        document.getElementById('viewVersions').onclick = () => {
            this.closeReadmeModal();
            setTimeout(() => showVersionModal(software.id), 300);
        };

        document.getElementById('rateSoftware').onclick = () => {
            this.closeReadmeModal();
            setTimeout(() => showFeedbackModal(software.id), 300);
        };

        try {
            // 模拟README内容加载
            await this.loadReadmeContent(software);
        } catch (error) {
            this.showReadmeError('无法加载说明文档');
        }
    }

    // 加载README内容
    async loadReadmeContent(software) {
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        const readmeContent = this.generateReadmeContent(software);
        
        // 隐藏加载状态，显示内容
        document.querySelector('.readme-loading').style.display = 'none';
        const readmeBody = document.getElementById('readmeBody');
        readmeBody.innerHTML = readmeContent;
        readmeBody.style.display = 'block';

        // 添加语法高亮和样式
        this.enhanceReadmeContent();
    }

    // 生成README内容（根据软件信息动态生成）
    generateReadmeContent(software) {
        const platformGuides = {
            windows: `
## 系统要求
- Windows 10 或更高版本
- 64位处理器
- 至少 4GB RAM
- 500MB 可用磁盘空间

## 安装步骤
1. 下载安装程序
2. 右键点击安装文件，选择"以管理员身份运行"
3. 按照安装向导的提示完成安装
4. 安装完成后，可以在开始菜单中找到程序

## 卸载方法
- 通过控制面板的"程序和功能"进行卸载
- 或者使用软件自带的卸载程序`,

            macos: `
## 系统要求
- macOS 12.0 (Monterey) 或更高版本
- Apple Silicon 或 Intel 处理器
- 至少 4GB RAM
- 500MB 可用磁盘空间

## 安装步骤
1. 下载 DMG 文件
2. 双击 DMG 文件挂载磁盘映像
3. 将应用程序拖拽到 Applications 文件夹
4. 从 Launchpad 或 Applications 文件夹启动应用

## 安全设置
首次运行时可能需要在"系统偏好设置" > "安全性与隐私"中允许运行。`,

            linux: `
## 系统要求
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 64位处理器
- 至少 2GB RAM
- 200MB 可用磁盘空间

## 安装步骤

### Ubuntu/Debian
\`\`\`bash
sudo dpkg -i ${software.name.toLowerCase().replace(/\s+/g, '-')}.deb
sudo apt-get install -f
\`\`\`

### CentOS/RHEL
\`\`\`bash
sudo rpm -i ${software.name.toLowerCase().replace(/\s+/g, '-')}.rpm
\`\`\`

### 通用方法
\`\`\`bash
tar -xzf ${software.name.toLowerCase().replace(/\s+/g, '-')}.tar.gz
cd ${software.name.toLowerCase().replace(/\s+/g, '-')}
./install.sh
\`\`\``,

            mobile: `
## 系统要求
- Android 8.0+ 或 iOS 13.0+
- 至少 3GB RAM
- 100MB 可用存储空间
- 网络连接

## Android 安装
1. 下载 APK 文件
2. 在设置中启用"未知来源"
3. 点击 APK 文件进行安装

## iOS 安装
通过 App Store 或 TestFlight 安装

## 权限说明
- 存储权限：用于保存用户数据
- 网络权限：用于数据同步
- 通知权限：用于推送更新提醒`
        };

        return `
            <div class="readme-section">
                <h1>${software.name}</h1>
                <p class="software-description">${software.description}</p>
                
                <div class="software-badges">
                    <span class="badge version">版本 ${software.version}</span>
                    <span class="badge platform">${this.getPlatformName(software.platform)}</span>
                    <span class="badge size">${software.size}</span>
                    ${software.rating ? `<span class="badge rating">⭐ ${software.rating}</span>` : ''}
                </div>
            </div>

            <div class="readme-section">
                <h2>功能特色</h2>
                <ul class="feature-list">
                    <li>✨ 现代化用户界面设计</li>
                    <li>🚀 高性能和稳定性</li>
                    <li>🔒 数据安全和隐私保护</li>
                    <li>🔄 自动更新机制</li>
                    <li>📱 跨平台同步支持</li>
                    <li>🎨 主题和个性化设置</li>
                </ul>
            </div>

            ${platformGuides[software.platform] || ''}

            <div class="readme-section">
                <h2>使用说明</h2>
                <ol class="instruction-list">
                    <li>启动应用程序</li>
                    <li>完成初始设置向导</li>
                    <li>根据需要配置个人偏好</li>
                    <li>开始使用各项功能</li>
                </ol>
            </div>

            <div class="readme-section">
                <h2>常见问题</h2>
                <div class="faq-item">
                    <h3>Q: 如何更新到最新版本？</h3>
                    <p>A: 软件会自动检查更新。您也可以在设置中手动检查更新。</p>
                </div>
                <div class="faq-item">
                    <h3>Q: 忘记密码怎么办？</h3>
                    <p>A: 可以通过邮箱重置密码，或联系技术支持。</p>
                </div>
                <div class="faq-item">
                    <h3>Q: 如何备份数据？</h3>
                    <p>A: 在设置中找到"数据备份"选项，按照提示完成备份。</p>
                </div>
            </div>

            <div class="readme-section">
                <h2>技术支持</h2>
                <p>如果您在使用过程中遇到任何问题，可以通过以下方式获取帮助：</p>
                <ul>
                    <li>📧 邮箱: support@software.com</li>
                    <li>🌐 官网: https://software.com</li>
                    <li>💬 在线客服: 9:00 - 18:00</li>
                    <li>📱 QQ群: 123456789</li>
                </ul>
            </div>

            <div class="readme-section">
                <h2>更新日志</h2>
                <div class="changelog-item">
                    <h3>v${software.version} (${new Date().toLocaleDateString()})</h3>
                    <ul>
                        <li>修复了已知问题</li>
                        <li>优化了用户体验</li>
                        <li>增加了新功能</li>
                        <li>提升了性能和稳定性</li>
                    </ul>
                </div>
            </div>

            <div class="readme-section">
                <h2>许可证</h2>
                <p>本软件遵循相关许可证协议。使用本软件即表示您同意遵守许可证条款。</p>
            </div>
        `;
    }

    // 增强README内容显示
    enhanceReadmeContent() {
        const readmeBody = document.getElementById('readmeBody');
        
        // 添加代码块高亮
        readmeBody.querySelectorAll('code').forEach(code => {
            code.classList.add('code-highlight');
        });

        // 添加链接处理
        readmeBody.querySelectorAll('a').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });

        // 添加滚动动画
        readmeBody.classList.add('fade-in');
    }

    // 关闭README模态框
    closeReadmeModal() {
        document.getElementById('readmeModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // 显示README错误
    showReadmeError(message) {
        document.querySelector('.readme-loading').style.display = 'none';
        document.getElementById('readmeBody').innerHTML = `
            <div class="readme-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>加载失败</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">重试</button>
            </div>
        `;
        document.getElementById('readmeBody').style.display = 'block';
    }

    // 下载软件
    downloadSoftware(software) {
        // 跟踪下载
        this.trackSoftwareDownload(software.id, software.name);
        
        // 执行下载
        const link = document.createElement('a');
        link.href = software.downloadUrl.startsWith('http') ? 
            software.downloadUrl : 
            `https://github.com/zhang123233123123/softwaremanagement/raw/main/${software.downloadUrl}`;
        link.download = software.name;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 显示下载通知
    showDownloadNotification(softwareName) {
        const notification = document.createElement('div');
        notification.className = 'download-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-download"></i>
                <div class="notification-text">
                    <strong>下载开始</strong>
                    <span>${softwareName}</span>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自动关闭
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // 手动关闭
        notification.querySelector('.notification-close').onclick = () => {
            notification.parentNode.removeChild(notification);
        };
    }

    // 显示详细统计
    showDetailedStats() {
        const modal = document.createElement('div');
        modal.className = 'modal detailed-stats-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line"></i> 详细统计</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="stats-details">
                    ${this.generateDetailedStatsContent()}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 关闭事件
        modal.querySelector('.close-btn').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    // 生成详细统计内容
    generateDetailedStatsContent() {
        const topSoftware = Object.entries(this.statistics.softwareDownloads)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 5);

        return `
            <div class="stats-section">
                <h3>访问统计</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${this.formatNumber(this.statistics.pageViews)}</div>
                        <div class="stat-label">总访问量</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getTodayViews()}</div>
                        <div class="stat-label">今日访问</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getWeekViews()}</div>
                        <div class="stat-label">本周访问</div>
                    </div>
                </div>
            </div>

            <div class="stats-section">
                <h3>下载统计</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${this.formatNumber(this.statistics.totalDownloads)}</div>
                        <div class="stat-label">总下载量</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Object.keys(this.statistics.softwareDownloads).length}</div>
                        <div class="stat-label">软件数量</div>
                    </div>
                </div>
            </div>

            ${topSoftware.length > 0 ? `
            <div class="stats-section">
                <h3>热门软件</h3>
                <div class="top-software">
                    ${topSoftware.map(([id, data], index) => `
                        <div class="software-rank">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${data.name}</span>
                            <span class="downloads">${data.count} 下载</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="stats-section">
                <h3>网站信息</h3>
                <div class="site-info">
                    <p><strong>运行时间:</strong> ${this.getRunningTime()}</p>
                    <p><strong>最后更新:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>数据存储:</strong> 本地浏览器存储</p>
                </div>
            </div>
        `;
    }

    // 获取本周访问量
    getWeekViews() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.statistics.visitHistory.filter(visit => 
            new Date(visit.timestamp) >= weekAgo
        ).length;
    }

    // 获取运行时间
    getRunningTime() {
        const startDate = new Date(this.statistics.startDate);
        const now = new Date();
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1天';
        if (diffDays < 30) return `${diffDays}天`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月`;
        return `${Math.floor(diffDays / 365)}年`;
    }

    // 工具函数
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getPlatformName(platform) {
        const names = {
            windows: 'Windows',
            macos: 'macOS',
            linux: 'Linux',
            mobile: '移动端'
        };
        return names[platform] || platform;
    }

    // 存储管理
    loadStatistics() {
        const saved = localStorage.getItem('website_statistics');
        return saved ? JSON.parse(saved) : {};
    }

    saveStatistics() {
        localStorage.setItem('website_statistics', JSON.stringify(this.statistics));
    }
}

// 全局函数
function showSoftwareReadme(softwareId) {
    if (readmeViewer) {
        readmeViewer.showReadme(softwareId);
    }
}

// 重写下载函数以包含统计
const originalDownloadSoftware = window.downloadSoftware;
window.downloadSoftware = function(url, name) {
    const software = softwareData.find(app => app.name === name);
    if (software && readmeViewer) {
        readmeViewer.trackSoftwareDownload(software.id, name);
    }
    
    // 执行原始下载逻辑
    if (originalDownloadSoftware) {
        originalDownloadSoftware(url, name);
    } else {
        // 如果没有原始函数，执行默认下载
        const link = document.createElement('a');
        link.href = url.startsWith('http') ? url : `https://github.com/zhang123233123123/softwaremanagement/raw/main/${url}`;
        link.download = name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// 初始化
let readmeViewer;
document.addEventListener('DOMContentLoaded', function() {
    readmeViewer = new ReadmeViewer();
});