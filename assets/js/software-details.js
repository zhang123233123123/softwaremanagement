// 软件详情页面增强功能

class SoftwareDetailsManager {
    constructor() {
        this.currentSoftware = null;
        this.relatedSoftware = [];
        this.init();
    }

    init() {
        this.enhanceSoftwareModal();
        this.setupDetailEventListeners();
    }

    // 增强软件模态框
    enhanceSoftwareModal() {
        // 重写原有的showSoftwareModal函数
        const originalShowModal = window.showSoftwareModal;
        window.showSoftwareModal = (id) => {
            this.showEnhancedSoftwareModal(id);
        };
    }

    // 显示增强的软件详情模态框
    showEnhancedSoftwareModal(id) {
        const software = softwareData.find(app => app.id === id);
        if (!software) return;

        this.currentSoftware = software;
        this.relatedSoftware = this.findRelatedSoftware(software);

        // 更新模态框内容
        this.updateModalContent(software);
        
        // 显示模态框
        const modal = document.getElementById('softwareModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // 记录浏览历史
        this.recordViewHistory(software);
    }

    // 更新模态框内容
    updateModalContent(software) {
        // 更新基本信息
        document.getElementById('modalTitle').textContent = software.name;
        document.getElementById('modalDescription').textContent = software.description;
        document.getElementById('modalVersion').textContent = software.version;
        document.getElementById('modalSize').textContent = software.size;
        document.getElementById('modalDownloads').textContent = formatNumber(software.downloads);

        // 设置图标
        const modalIcon = document.getElementById('modalIcon');
        modalIcon.innerHTML = `<i class="${software.icon}" style="font-size: 4rem; color: var(--secondary-color);"></i>`;

        // 更新模态框主体内容
        const modalBody = document.querySelector('#softwareModal .modal-body');
        modalBody.innerHTML = this.generateEnhancedModalContent(software);

        // 设置事件监听器
        this.setupModalEventListeners(software);
    }

    // 生成增强的模态框内容
    generateEnhancedModalContent(software) {
        return `
            <div class="software-detail-header">
                <div class="software-icon-large">
                    <i class="${software.icon}"></i>
                </div>
                <div class="software-main-info">
                    <h2>${software.name}</h2>
                    <p class="software-description">${software.description}</p>
                    
                    ${software.rating ? `
                    <div class="software-rating">
                        <div class="rating-stars">
                            ${'★'.repeat(Math.floor(software.rating))}${'☆'.repeat(5-Math.floor(software.rating))}
                        </div>
                        <span class="rating-score">${software.rating}</span>
                        <span class="rating-count">(${this.getReviewCount(software.id)} 评价)</span>
                    </div>
                    ` : ''}

                    <div class="software-meta-info">
                        <div class="meta-item">
                            <i class="fas fa-tag"></i>
                            <span>版本 ${software.version}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-hdd"></i>
                            <span>${software.size}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-download"></i>
                            <span>${formatNumber(software.downloads)} 下载</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>更新: ${software.lastUpdated || '未知'}</span>
                        </div>
                    </div>

                    ${software.tags ? `
                    <div class="software-tags-detail">
                        ${software.tags.map(tag => `<span class="tag-detail">${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="software-detail-tabs">
                <button class="detail-tab active" data-tab="overview">概述</button>
                <button class="detail-tab" data-tab="versions">版本历史</button>
                <button class="detail-tab" data-tab="reviews">用户评价</button>
                <button class="detail-tab" data-tab="related">相关软件</button>
                <button class="detail-tab" data-tab="info">详细信息</button>
            </div>

            <div class="software-detail-content">
                <div class="detail-tab-content active" id="overviewTab">
                    ${this.generateOverviewContent(software)}
                </div>
                <div class="detail-tab-content" id="versionsTab">
                    ${this.generateVersionsContent(software)}
                </div>
                <div class="detail-tab-content" id="reviewsTab">
                    ${this.generateReviewsContent(software)}
                </div>
                <div class="detail-tab-content" id="relatedTab">
                    ${this.generateRelatedContent()}
                </div>
                <div class="detail-tab-content" id="infoTab">
                    ${this.generateInfoContent(software)}
                </div>
            </div>

            <div class="software-detail-actions">
                <button class="action-btn primary" onclick="downloadSoftware('${software.downloadUrl}', '${software.name}')">
                    <i class="fas fa-download"></i>
                    立即下载
                </button>
                <button class="action-btn secondary" onclick="showFeedbackModal(${software.id})">
                    <i class="fas fa-star"></i>
                    评价软件
                </button>
                <button class="action-btn secondary" onclick="showVersionModal(${software.id})">
                    <i class="fas fa-history"></i>
                    版本历史
                </button>
                <button class="action-btn secondary" onclick="softwareDetailsManager.addToFavorites(${software.id})">
                    <i class="fas fa-heart"></i>
                    收藏
                </button>
                <button class="action-btn secondary" onclick="softwareDetailsManager.shareSoftware(${software.id})">
                    <i class="fas fa-share"></i>
                    分享
                </button>
            </div>
        `;
    }

    // 生成概述内容
    generateOverviewContent(software) {
        return `
            <div class="overview-content">
                <div class="software-screenshots">
                    ${software.screenshots && software.screenshots.length > 0 ? `
                        <h3>软件截图</h3>
                        <div class="screenshots-gallery">
                            ${software.screenshots.map((img, index) => `
                                <img src="${img}" alt="${software.name} 截图 ${index + 1}" 
                                     onclick="softwareDetailsManager.openImageModal('${img}')"
                                     onerror="this.style.display='none'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="software-features">
                    <h3>主要特色</h3>
                    <div class="features-list">
                        ${this.generateFeaturesList(software)}
                    </div>
                </div>

                <div class="software-requirements">
                    <h3>系统要求</h3>
                    <div class="requirements-info">
                        ${this.generateSystemRequirements(software)}
                    </div>
                </div>

                <div class="download-stats">
                    <h3>下载统计</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <i class="fas fa-download"></i>
                            <span class="stat-number">${formatNumber(software.downloads)}</span>
                            <span class="stat-label">总下载量</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calendar-week"></i>
                            <span class="stat-number">${this.getWeeklyDownloads(software.id)}</span>
                            <span class="stat-label">周下载量</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-star"></i>
                            <span class="stat-number">${software.rating || 'N/A'}</span>
                            <span class="stat-label">平均评分</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span class="stat-number">${this.getReviewCount(software.id)}</span>
                            <span class="stat-label">评价数量</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 生成版本历史内容
    generateVersionsContent(software) {
        const versions = versionManager ? versionManager.getVersionHistory(software.id) : [];
        
        if (versions.length === 0) {
            return `
                <div class="no-versions">
                    <i class="fas fa-history"></i>
                    <p>暂无版本历史记录</p>
                    <button onclick="showVersionModal(${software.id})" class="btn-primary">
                        管理版本
                    </button>
                </div>
            `;
        }

        return `
            <div class="versions-list">
                ${versions.slice(0, 5).map((version, index) => `
                    <div class="version-item-detail ${index === 0 ? 'current' : ''}">
                        <div class="version-header">
                            <h4>v${version.version}</h4>
                            ${index === 0 ? '<span class="current-badge">当前版本</span>' : ''}
                            <span class="version-date">${version.date}</span>
                        </div>
                        <div class="version-info">
                            <span class="version-size">${version.size}</span>
                        </div>
                        <div class="version-notes">
                            ${version.notes || '无更新说明'}
                        </div>
                        <div class="version-actions">
                            <button onclick="downloadVersion('${version.downloadUrl}', '${software.name}', '${version.version}')" 
                                    class="btn-small">
                                <i class="fas fa-download"></i> 下载
                            </button>
                        </div>
                    </div>
                `).join('')}
                
                ${versions.length > 5 ? `
                    <div class="more-versions">
                        <button onclick="showVersionModal(${software.id})" class="btn-outline">
                            查看全部 ${versions.length} 个版本
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // 生成评价内容
    generateReviewsContent(software) {
        const reviews = feedbackSystem ? feedbackSystem.getSoftwareFeedbacks(software.id) : [];
        
        if (reviews.length === 0) {
            return `
                <div class="no-reviews">
                    <i class="fas fa-star"></i>
                    <p>暂无用户评价</p>
                    <button onclick="showFeedbackModal(${software.id})" class="btn-primary">
                        写第一个评价
                    </button>
                </div>
            `;
        }

        return `
            <div class="reviews-summary">
                <div class="rating-overview">
                    <div class="avg-rating-large">
                        <span class="rating-number">${software.rating || 0}</span>
                        <div class="rating-stars">
                            ${'★'.repeat(Math.floor(software.rating || 0))}${'☆'.repeat(5-Math.floor(software.rating || 0))}
                        </div>
                        <span class="rating-count">${reviews.length} 个评价</span>
                    </div>
                    <div class="rating-distribution">
                        ${this.generateRatingDistribution(reviews)}
                    </div>
                </div>
            </div>

            <div class="reviews-list">
                ${reviews.slice(0, 3).map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <span class="reviewer-name">${review.userName}</span>
                                <div class="review-rating">
                                    ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                                </div>
                            </div>
                            <span class="review-date">${new Date(review.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div class="review-content">
                            ${review.comment}
                        </div>
                    </div>
                `).join('')}
                
                ${reviews.length > 3 ? `
                    <div class="more-reviews">
                        <button onclick="showFeedbackList(${software.id})" class="btn-outline">
                            查看全部 ${reviews.length} 个评价
                        </button>
                    </div>
                ` : ''}
            </div>

            <div class="add-review">
                <button onclick="showFeedbackModal(${software.id})" class="btn-primary">
                    <i class="fas fa-plus"></i>
                    添加评价
                </button>
            </div>
        `;
    }

    // 生成相关软件内容
    generateRelatedContent() {
        if (this.relatedSoftware.length === 0) {
            return `
                <div class="no-related">
                    <i class="fas fa-search"></i>
                    <p>暂无相关软件推荐</p>
                </div>
            `;
        }

        return `
            <div class="related-software">
                <h3>您可能还喜欢</h3>
                <div class="related-grid">
                    ${this.relatedSoftware.map(software => `
                        <div class="related-item" onclick="softwareDetailsManager.showEnhancedSoftwareModal(${software.id})">
                            <div class="related-icon">
                                <i class="${software.icon}"></i>
                            </div>
                            <div class="related-info">
                                <h4>${software.name}</h4>
                                <p>${software.description}</p>
                                <div class="related-meta">
                                    ${software.rating ? `
                                        <span class="related-rating">
                                            ★ ${software.rating}
                                        </span>
                                    ` : ''}
                                    <span class="related-downloads">
                                        ${formatNumber(software.downloads)} 下载
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 生成详细信息内容
    generateInfoContent(software) {
        return `
            <div class="detailed-info">
                <div class="info-section">
                    <h3>基本信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">软件名称:</span>
                            <span class="info-value">${software.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">版本号:</span>
                            <span class="info-value">${software.version}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">文件大小:</span>
                            <span class="info-value">${software.size}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">支持平台:</span>
                            <span class="info-value">${getPlatformName(software.platform)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">软件分类:</span>
                            <span class="info-value">${this.getCategoryName(software.category)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">更新时间:</span>
                            <span class="info-value">${software.lastUpdated || '未知'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">下载次数:</span>
                            <span class="info-value">${formatNumber(software.downloads)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">用户评分:</span>
                            <span class="info-value">${software.rating ? `${software.rating} 分` : '暂无评分'}</span>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h3>下载信息</h3>
                    <div class="download-info">
                        <div class="info-item">
                            <span class="info-label">文件名:</span>
                            <span class="info-value">${this.getFileName(software.downloadUrl)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">文件类型:</span>
                            <span class="info-value">${this.getFileType(software.downloadUrl)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">下载链接:</span>
                            <span class="info-value">
                                <a href="${software.downloadUrl}" target="_blank" class="download-link">
                                    点击下载
                                </a>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h3>安全信息</h3>
                    <div class="security-info">
                        <div class="security-item safe">
                            <i class="fas fa-shield-alt"></i>
                            <span>已通过安全检测</span>
                        </div>
                        <div class="security-item safe">
                            <i class="fas fa-virus"></i>
                            <span>无病毒无恶意代码</span>
                        </div>
                        <div class="security-item safe">
                            <i class="fas fa-certificate"></i>
                            <span>官方来源可信</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 设置模态框事件监听器
    setupModalEventListeners(software) {
        // 标签页切换
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchDetailTab(tab.dataset.tab);
            });
        });

        // 关闭按钮
        const closeBtn = document.querySelector('#softwareModal .close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('softwareModal').style.display = 'none';
                document.body.style.overflow = 'auto';
            };
        }
    }

    // 设置详情事件监听器
    setupDetailEventListeners() {
        // 关闭模态框点击外部
        document.addEventListener('click', (e) => {
            if (e.target.id === 'softwareModal') {
                document.getElementById('softwareModal').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // 切换详情标签页
    switchDetailTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 显示对应内容
        document.querySelectorAll('.detail-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    // 查找相关软件
    findRelatedSoftware(software) {
        return softwareData
            .filter(app => 
                app.id !== software.id && (
                    app.platform === software.platform ||
                    app.category === software.category ||
                    (app.tags && software.tags && 
                     app.tags.some(tag => software.tags.includes(tag))
                    )
                )
            )
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 6);
    }

    // 生成特色列表
    generateFeaturesList(software) {
        const defaultFeatures = [
            '安全可靠，无病毒无广告',
            '界面简洁，操作便捷',
            '功能强大，性能优秀',
            '持续更新，技术支持'
        ];

        return defaultFeatures.map(feature => 
            `<div class="feature-item">
                <i class="fas fa-check"></i>
                <span>${feature}</span>
            </div>`
        ).join('');
    }

    // 生成系统要求
    generateSystemRequirements(software) {
        const requirements = {
            windows: {
                os: 'Windows 10/11',
                processor: '1GHz 处理器',
                memory: '2GB RAM',
                storage: '1GB 可用空间'
            },
            macos: {
                os: 'macOS 12.0+',
                processor: 'Intel 或 Apple Silicon',
                memory: '4GB RAM',
                storage: '2GB 可用空间'
            },
            linux: {
                os: 'Ubuntu 20.04+ / CentOS 8+',
                processor: '1GHz 处理器',
                memory: '2GB RAM',
                storage: '1GB 可用空间'
            },
            mobile: {
                os: 'Android 8.0+ / iOS 13.0+',
                processor: '支持64位处理器',
                memory: '2GB RAM',
                storage: '500MB 可用空间'
            }
        };

        const req = requirements[software.platform] || requirements.windows;

        return `
            <div class="requirement-item">
                <span class="req-label">操作系统:</span>
                <span class="req-value">${req.os}</span>
            </div>
            <div class="requirement-item">
                <span class="req-label">处理器:</span>
                <span class="req-value">${req.processor}</span>
            </div>
            <div class="requirement-item">
                <span class="req-label">内存:</span>
                <span class="req-value">${req.memory}</span>
            </div>
            <div class="requirement-item">
                <span class="req-label">存储空间:</span>
                <span class="req-value">${req.storage}</span>
            </div>
        `;
    }

    // 生成评分分布
    generateRatingDistribution(reviews) {
        const distribution = [5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return { rating, count, percentage };
        });

        return distribution.map(item => `
            <div class="rating-bar">
                <span class="rating-label">${item.rating}星</span>
                <div class="rating-progress">
                    <div class="rating-fill" style="width: ${item.percentage}%"></div>
                </div>
                <span class="rating-count">${item.count}</span>
            </div>
        `).join('');
    }

    // 获取评价数量
    getReviewCount(softwareId) {
        return feedbackSystem ? feedbackSystem.getSoftwareFeedbacks(softwareId).length : 0;
    }

    // 获取周下载量
    getWeeklyDownloads(softwareId) {
        // 模拟周下载量（实际项目中应该从后端获取）
        return Math.floor(Math.random() * 500) + 50;
    }

    // 获取分类名称
    getCategoryName(category) {
        const categoryNames = {
            development: '开发工具',
            browser: '浏览器',
            media: '多媒体',
            office: '办公软件',
            game: '游戏',
            utility: '实用工具'
        };
        return categoryNames[category] || '其他';
    }

    // 获取文件名
    getFileName(url) {
        return url.split('/').pop() || '未知';
    }

    // 获取文件类型
    getFileType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const types = {
            exe: 'Windows 可执行文件',
            dmg: 'macOS 磁盘映像',
            deb: 'Debian 安装包',
            rpm: 'RPM 安装包',
            apk: 'Android 安装包',
            ipa: 'iOS 安装包'
        };
        return types[extension] || '未知类型';
    }

    // 记录浏览历史
    recordViewHistory(software) {
        const history = JSON.parse(localStorage.getItem('view_history') || '[]');
        
        // 移除已存在的记录
        const filtered = history.filter(item => item.id !== software.id);
        
        // 添加到开头
        filtered.unshift({
            id: software.id,
            name: software.name,
            timestamp: new Date().toISOString()
        });
        
        // 限制历史记录数量
        const limited = filtered.slice(0, 20);
        
        localStorage.setItem('view_history', JSON.stringify(limited));
    }

    // 添加到收藏夹
    addToFavorites(softwareId) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.includes(softwareId)) {
            this.showNotification('已在收藏夹中', 'info');
            return;
        }
        
        favorites.push(softwareId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.showNotification('已添加到收藏夹', 'success');
    }

    // 分享软件
    sharesoftware(softwareId) {
        const software = softwareData.find(app => app.id === softwareId);
        if (!software) return;

        if (navigator.share) {
            navigator.share({
                title: software.name,
                text: software.description,
                url: window.location.href
            });
        } else {
            // 复制链接到剪贴板
            const url = `${window.location.origin}${window.location.pathname}#software-${softwareId}`;
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('链接已复制到剪贴板', 'success');
            });
        }
    }

    // 打开图片模态框
    openImageModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-close">&times;</span>
                <img src="${imageSrc}" alt="软件截图">
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 事件监听
        modal.querySelector('.image-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
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

// 初始化软件详情管理器
let softwareDetailsManager;
document.addEventListener('DOMContentLoaded', function() {
    softwareDetailsManager = new SoftwareDetailsManager();
});