// 软件版本管理系统

class VersionManager {
    constructor() {
        this.versions = this.loadVersions();
        this.init();
    }

    init() {
        this.createVersionModal();
        this.setupEventListeners();
    }

    // 加载版本数据
    loadVersions() {
        const saved = localStorage.getItem('software_versions');
        return saved ? JSON.parse(saved) : {};
    }

    // 保存版本数据
    saveVersions() {
        localStorage.setItem('software_versions', JSON.stringify(this.versions));
    }

    // 创建版本管理模态框
    createVersionModal() {
        const modalHTML = `
            <div class="modal" id="versionModal">
                <div class="modal-content">
                    <span class="close" id="closeVersion">&times;</span>
                    <div class="modal-body">
                        <h2>版本历史</h2>
                        <div class="version-info" id="versionSoftwareInfo">
                            <!-- 软件信息将动态填充 -->
                        </div>
                        <div class="version-list" id="versionList">
                            <!-- 版本列表将动态填充 -->
                        </div>
                        <div class="add-version-section" style="display: none;">
                            <h3>添加新版本</h3>
                            <div class="version-form">
                                <div class="form-row">
                                    <label>版本号:</label>
                                    <input type="text" id="newVersionNumber" placeholder="例: 1.2.0">
                                </div>
                                <div class="form-row">
                                    <label>发布日期:</label>
                                    <input type="date" id="newVersionDate">
                                </div>
                                <div class="form-row">
                                    <label>文件大小:</label>
                                    <input type="text" id="newVersionSize" placeholder="例: 150.5 MB">
                                </div>
                                <div class="form-row">
                                    <label>下载链接:</label>
                                    <input type="text" id="newVersionUrl" placeholder="相对路径或完整URL">
                                </div>
                                <div class="form-row">
                                    <label>更新说明:</label>
                                    <textarea id="newVersionNotes" placeholder="描述本版本的新功能和修复..."></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="button" id="cancelAddVersion">取消</button>
                                    <button type="button" id="saveNewVersion">保存版本</button>
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
        // 关闭模态框
        document.getElementById('closeVersion').addEventListener('click', () => {
            this.closeVersionModal();
        });

        // 点击模态框外部关闭
        document.getElementById('versionModal').addEventListener('click', (e) => {
            if (e.target.id === 'versionModal') {
                this.closeVersionModal();
            }
        });
    }

    // 显示版本历史模态框
    showVersionModal(softwareId) {
        const software = softwareData.find(app => app.id === softwareId);
        if (!software) return;

        this.currentSoftware = software;

        // 填充软件信息
        document.getElementById('versionSoftwareInfo').innerHTML = `
            <div class="version-software">
                <div class="software-icon">
                    <i class="${software.icon}"></i>
                </div>
                <div class="software-details">
                    <h4>${software.name}</h4>
                    <p>当前版本: ${software.version}</p>
                </div>
                <button type="button" id="addVersionBtn" class="add-version-btn">
                    <i class="fas fa-plus"></i> 添加版本
                </button>
            </div>
        `;

        // 显示版本列表
        this.renderVersionList(softwareId);

        // 添加版本按钮事件
        document.getElementById('addVersionBtn').addEventListener('click', () => {
            this.showAddVersionForm();
        });

        // 显示模态框
        document.getElementById('versionModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // 渲染版本列表
    renderVersionList(softwareId) {
        const versions = this.getVersionHistory(softwareId);
        const versionList = document.getElementById('versionList');

        if (versions.length === 0) {
            versionList.innerHTML = `
                <div class="no-versions">
                    <i class="fas fa-history" style="font-size: 2rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                    <p>暂无版本历史记录</p>
                </div>
            `;
            return;
        }

        versionList.innerHTML = `
            <div class="version-items">
                ${versions.map((version, index) => `
                    <div class="version-item ${index === 0 ? 'current' : ''}">
                        <div class="version-header">
                            <div class="version-info-main">
                                <h4>v${version.version}</h4>
                                ${index === 0 ? '<span class="current-badge">当前版本</span>' : ''}
                            </div>
                            <div class="version-meta">
                                <span class="version-date">${version.date}</span>
                                <span class="version-size">${version.size}</span>
                            </div>
                        </div>
                        <div class="version-notes">
                            ${version.notes || '无更新说明'}
                        </div>
                        <div class="version-actions">
                            <button class="download-version-btn" onclick="downloadVersion('${version.downloadUrl}', '${this.currentSoftware.name}', '${version.version}')">
                                <i class="fas fa-download"></i> 下载此版本
                            </button>
                            ${index !== 0 ? `<button class="delete-version-btn" onclick="versionManager.deleteVersion('${softwareId}', ${index})">
                                <i class="fas fa-trash"></i> 删除
                            </button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 显示添加版本表单
    showAddVersionForm() {
        const addSection = document.querySelector('.add-version-section');
        addSection.style.display = 'block';

        // 设置默认日期为今天
        document.getElementById('newVersionDate').value = new Date().toISOString().split('T')[0];

        // 设置事件监听器
        document.getElementById('cancelAddVersion').onclick = () => {
            addSection.style.display = 'none';
            this.resetAddVersionForm();
        };

        document.getElementById('saveNewVersion').onclick = () => {
            this.saveNewVersion();
        };
    }

    // 保存新版本
    saveNewVersion() {
        const versionNumber = document.getElementById('newVersionNumber').value.trim();
        const versionDate = document.getElementById('newVersionDate').value;
        const versionSize = document.getElementById('newVersionSize').value.trim();
        const versionUrl = document.getElementById('newVersionUrl').value.trim();
        const versionNotes = document.getElementById('newVersionNotes').value.trim();

        // 验证输入
        if (!versionNumber || !versionDate || !versionSize || !versionUrl) {
            this.showNotification('请填写所有必填字段', 'warning');
            return;
        }

        // 版本号格式验证
        if (!/^\d+\.\d+(\.\d+)?$/.test(versionNumber)) {
            this.showNotification('版本号格式不正确，请使用 x.y.z 格式', 'warning');
            return;
        }

        const newVersion = {
            version: versionNumber,
            date: versionDate,
            size: versionSize,
            downloadUrl: versionUrl,
            notes: versionNotes,
            timestamp: new Date().toISOString()
        };

        // 添加到版本历史
        this.addVersion(this.currentSoftware.id, newVersion);

        // 更新软件数据中的当前版本
        this.currentSoftware.version = versionNumber;
        this.currentSoftware.size = versionSize;
        this.currentSoftware.downloadUrl = versionUrl;
        this.currentSoftware.lastUpdated = versionDate;

        // 隐藏表单并刷新列表
        document.querySelector('.add-version-section').style.display = 'none';
        this.resetAddVersionForm();
        this.renderVersionList(this.currentSoftware.id);

        this.showNotification('新版本添加成功', 'success');

        // 刷新主页显示
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        filterSoftware(activeFilter);
    }

    // 重置添加版本表单
    resetAddVersionForm() {
        document.getElementById('newVersionNumber').value = '';
        document.getElementById('newVersionDate').value = '';
        document.getElementById('newVersionSize').value = '';
        document.getElementById('newVersionUrl').value = '';
        document.getElementById('newVersionNotes').value = '';
    }

    // 添加版本到历史记录
    addVersion(softwareId, version) {
        if (!this.versions[softwareId]) {
            this.versions[softwareId] = [];
        }

        // 插入到数组开头（最新版本在前）
        this.versions[softwareId].unshift(version);
        
        // 限制版本历史数量（最多保留20个版本）
        if (this.versions[softwareId].length > 20) {
            this.versions[softwareId] = this.versions[softwareId].slice(0, 20);
        }

        this.saveVersions();
    }

    // 获取版本历史
    getVersionHistory(softwareId) {
        return this.versions[softwareId] || [];
    }

    // 删除版本
    deleteVersion(softwareId, versionIndex) {
        if (confirm('确定要删除这个版本吗？')) {
            this.versions[softwareId].splice(versionIndex, 1);
            this.saveVersions();
            this.renderVersionList(softwareId);
            this.showNotification('版本已删除', 'success');
        }
    }

    // 关闭版本模态框
    closeVersionModal() {
        document.getElementById('versionModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.querySelector('.add-version-section').style.display = 'none';
        this.resetAddVersionForm();
    }

    // 检查更新
    checkForUpdates(softwareId) {
        const versions = this.getVersionHistory(softwareId);
        const software = softwareData.find(app => app.id === softwareId);
        
        if (versions.length === 0) {
            return { hasUpdate: false, message: '无版本历史记录' };
        }

        const latestVersion = versions[0];
        const currentVersion = software.version;

        if (this.compareVersions(latestVersion.version, currentVersion) > 0) {
            return {
                hasUpdate: true,
                message: `发现新版本 v${latestVersion.version}`,
                latestVersion: latestVersion
            };
        }

        return { hasUpdate: false, message: '已是最新版本' };
    }

    // 版本号比较
    compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        const maxLength = Math.max(v1Parts.length, v2Parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
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

// 下载特定版本
function downloadVersion(url, name, version) {
    const link = document.createElement('a');
    link.href = url.startsWith('http') ? url : `https://github.com/zhang123233123123/softwaremanagement/raw/main/${url}`;
    link.download = `${name}_v${version}`;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    versionManager.showNotification(`开始下载 ${name} v${version}`, 'success');
}

// 初始化版本管理器
let versionManager;
document.addEventListener('DOMContentLoaded', function() {
    versionManager = new VersionManager();
});

// 全局函数供其他脚本调用
function showVersionModal(softwareId) {
    if (versionManager) {
        versionManager.showVersionModal(softwareId);
    }
}