// 用户反馈和评分系统

class FeedbackSystem {
    constructor() {
        this.feedbacks = this.loadFeedbacks();
        this.init();
    }

    init() {
        this.createFeedbackModal();
        this.setupEventListeners();
    }

    // 加载本地存储的反馈数据
    loadFeedbacks() {
        const saved = localStorage.getItem('software_feedbacks');
        return saved ? JSON.parse(saved) : {};
    }

    // 保存反馈数据到本地存储
    saveFeedbacks() {
        localStorage.setItem('software_feedbacks', JSON.stringify(this.feedbacks));
    }

    // 创建反馈模态框
    createFeedbackModal() {
        const modalHTML = `
            <div class="modal" id="feedbackModal">
                <div class="modal-content">
                    <span class="close" id="closeFeedback">&times;</span>
                    <div class="modal-body">
                        <h2>软件评价</h2>
                        <div class="feedback-form">
                            <div class="software-info" id="feedbackSoftwareInfo">
                                <!-- 软件信息将动态填充 -->
                            </div>
                            
                            <div class="rating-section">
                                <h3>给这个软件评分:</h3>
                                <div class="star-rating" id="starRating">
                                    <span class="star" data-rating="1">★</span>
                                    <span class="star" data-rating="2">★</span>
                                    <span class="star" data-rating="3">★</span>
                                    <span class="star" data-rating="4">★</span>
                                    <span class="star" data-rating="5">★</span>
                                </div>
                                <p class="rating-text" id="ratingText">请选择评分</p>
                            </div>

                            <div class="comment-section">
                                <h3>评价内容:</h3>
                                <textarea 
                                    id="feedbackComment" 
                                    placeholder="请分享你对这个软件的使用体验..."
                                    maxlength="500"
                                ></textarea>
                                <div class="char-count">
                                    <span id="charCount">0</span>/500
                                </div>
                            </div>

                            <div class="user-info">
                                <input 
                                    type="text" 
                                    id="userName" 
                                    placeholder="您的昵称（可选）"
                                    maxlength="20"
                                >
                                <input 
                                    type="email" 
                                    id="userEmail" 
                                    placeholder="您的邮箱（可选）"
                                >
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn-cancel" id="cancelFeedback">取消</button>
                                <button type="button" class="btn-submit" id="submitFeedback">提交评价</button>
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
        // 星级评分
        document.getElementById('starRating').addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const rating = parseInt(e.target.dataset.rating);
                this.setRating(rating);
            }
        });

        // 星级悬停效果
        document.getElementById('starRating').addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('star')) {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            }
        });

        document.getElementById('starRating').addEventListener('mouseout', () => {
            this.highlightStars(this.currentRating || 0);
        });

        // 字符计数
        document.getElementById('feedbackComment').addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('charCount').textContent = count;
        });

        // 模态框控制
        document.getElementById('closeFeedback').addEventListener('click', () => {
            this.closeFeedbackModal();
        });

        document.getElementById('cancelFeedback').addEventListener('click', () => {
            this.closeFeedbackModal();
        });

        document.getElementById('submitFeedback').addEventListener('click', () => {
            this.submitFeedback();
        });

        // 点击模态框外部关闭
        document.getElementById('feedbackModal').addEventListener('click', (e) => {
            if (e.target.id === 'feedbackModal') {
                this.closeFeedbackModal();
            }
        });
    }

    // 设置星级评分
    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
        
        const ratingTexts = {
            1: '很差',
            2: '一般',
            3: '还行',
            4: '不错',
            5: '很棒'
        };
        
        document.getElementById('ratingText').textContent = `${rating}星 - ${ratingTexts[rating]}`;
    }

    // 高亮星星
    highlightStars(rating) {
        const stars = document.querySelectorAll('#starRating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // 显示反馈模态框
    showFeedbackModal(softwareId) {
        const software = softwareData.find(app => app.id === softwareId);
        if (!software) return;

        this.currentSoftware = software;
        this.currentRating = 0;

        // 填充软件信息
        document.getElementById('feedbackSoftwareInfo').innerHTML = `
            <div class="feedback-software">
                <div class="software-icon">
                    <i class="${software.icon}"></i>
                </div>
                <div class="software-details">
                    <h4>${software.name}</h4>
                    <p>${software.description}</p>
                </div>
            </div>
        `;

        // 重置表单
        this.resetForm();

        // 显示模态框
        document.getElementById('feedbackModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // 重置表单
    resetForm() {
        this.currentRating = 0;
        this.highlightStars(0);
        document.getElementById('ratingText').textContent = '请选择评分';
        document.getElementById('feedbackComment').value = '';
        document.getElementById('charCount').textContent = '0';
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
    }

    // 关闭反馈模态框
    closeFeedbackModal() {
        document.getElementById('feedbackModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // 提交反馈
    submitFeedback() {
        if (!this.currentRating) {
            this.showNotification('请先给软件评分', 'warning');
            return;
        }

        const comment = document.getElementById('feedbackComment').value.trim();
        if (!comment) {
            this.showNotification('请填写评价内容', 'warning');
            return;
        }

        const feedback = {
            softwareId: this.currentSoftware.id,
            rating: this.currentRating,
            comment: comment,
            userName: document.getElementById('userName').value.trim() || '匿名用户',
            userEmail: document.getElementById('userEmail').value.trim(),
            timestamp: new Date().toISOString(),
            helpful: 0
        };

        // 保存反馈
        if (!this.feedbacks[this.currentSoftware.id]) {
            this.feedbacks[this.currentSoftware.id] = [];
        }

        this.feedbacks[this.currentSoftware.id].push(feedback);
        this.saveFeedbacks();

        // 更新软件评分
        this.updateSoftwareRating(this.currentSoftware.id);

        this.showNotification('感谢您的评价！', 'success');
        this.closeFeedbackModal();

        // 刷新软件显示
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        filterSoftware(activeFilter);
    }

    // 更新软件平均评分
    updateSoftwareRating(softwareId) {
        const software = softwareData.find(app => app.id === softwareId);
        const feedbacks = this.feedbacks[softwareId] || [];
        
        if (feedbacks.length > 0) {
            const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
            software.rating = (totalRating / feedbacks.length).toFixed(1);
        }
    }

    // 获取软件反馈列表
    getSoftwareFeedbacks(softwareId) {
        return this.feedbacks[softwareId] || [];
    }

    // 显示软件反馈列表
    showFeedbackList(softwareId) {
        const feedbacks = this.getSoftwareFeedbacks(softwareId);
        const software = softwareData.find(app => app.id === softwareId);
        
        if (feedbacks.length === 0) {
            this.showNotification('暂无用户评价', 'info');
            return;
        }

        const feedbackHTML = `
            <div class="feedback-list-modal">
                <div class="feedback-list-content">
                    <div class="feedback-header">
                        <h2>${software.name} - 用户评价</h2>
                        <span class="close-feedback-list">&times;</span>
                    </div>
                    <div class="feedback-stats">
                        <div class="avg-rating">
                            <span class="rating-number">${software.rating || 0}</span>
                            <div class="rating-stars">
                                ${'★'.repeat(Math.floor(software.rating || 0))}${'☆'.repeat(5-Math.floor(software.rating || 0))}
                            </div>
                            <span class="rating-count">(${feedbacks.length} 条评价)</span>
                        </div>
                    </div>
                    <div class="feedback-items">
                        ${feedbacks.map(fb => `
                            <div class="feedback-item">
                                <div class="feedback-author">
                                    <span class="author-name">${fb.userName}</span>
                                    <div class="feedback-rating">
                                        ${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}
                                    </div>
                                    <span class="feedback-date">${new Date(fb.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div class="feedback-content">
                                    ${fb.comment}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', feedbackHTML);

        // 关闭按钮事件
        document.querySelector('.close-feedback-list').addEventListener('click', () => {
            document.querySelector('.feedback-list-modal').remove();
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
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

// 初始化反馈系统
let feedbackSystem;
document.addEventListener('DOMContentLoaded', function() {
    feedbackSystem = new FeedbackSystem();
});

// 全局函数供其他脚本调用
function showFeedbackModal(softwareId) {
    if (feedbackSystem) {
        feedbackSystem.showFeedbackModal(softwareId);
    }
}

function showFeedbackList(softwareId) {
    if (feedbackSystem) {
        feedbackSystem.showFeedbackList(softwareId);
    }
}