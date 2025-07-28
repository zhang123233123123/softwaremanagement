// 管理员后台JavaScript

// 管理员密码（实际使用时应该加密存储）
const ADMIN_PASSWORD = 'admin123456'; // 请修改为您的密码

// 检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadCurrentSoftware();
    
    // 设置默认更新日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('lastUpdated').value = today;
});

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    const loginTime = localStorage.getItem('admin_login_time');
    
    // 检查是否在24小时内登录过
    if (isLoggedIn === 'true' && loginTime) {
        const now = new Date().getTime();
        const loginTimestamp = parseInt(loginTime);
        const hoursDiff = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            showAdminInterface();
            return;
        }
    }
    
    // 显示登录界面
    showLoginInterface();
}

// 显示登录界面
function showLoginInterface() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

// 显示管理界面
function showAdminInterface() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        // 登录成功
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_login_time', new Date().getTime().toString());
        
        showAlert('登录成功！', 'success');
        setTimeout(() => {
            showAdminInterface();
        }, 1000);
    } else {
        // 登录失败
        showAlert('密码错误，请重试！', 'error');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_login_time');
    showAlert('已退出登录', 'success');
    setTimeout(() => {
        showLoginInterface();
    }, 1000);
}

// 处理软件上传
function handleSoftwareUpload(event) {
    event.preventDefault();
    
    // 获取表单数据
    const formData = {
        name: document.getElementById('softwareName').value.trim(),
        version: document.getElementById('softwareVersion').value.trim(),
        description: document.getElementById('softwareDescription').value.trim(),
        platform: document.getElementById('softwarePlatform').value,
        category: document.getElementById('softwareCategory').value || 'other',
        size: document.getElementById('softwareSize').value.trim(),
        icon: document.getElementById('softwareIcon').value.trim() || 'fas fa-desktop',
        downloadUrl: document.getElementById('downloadUrl').value.trim(),
        tags: document.getElementById('softwareTags').value.trim(),
        rating: document.getElementById('softwareRating').value || null,
        lastUpdated: document.getElementById('lastUpdated').value || new Date().toISOString().split('T')[0]
    };
    
    // 验证必填字段
    if (!formData.name || !formData.version || !formData.description || 
        !formData.platform || !formData.size || !formData.downloadUrl) {
        showAlert('请填写所有必填字段！', 'error');
        return;
    }
    
    // 生成新的ID
    const newId = generateNewId();
    
    // 处理标签
    const tagsArray = formData.tags ? 
        formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // 生成软件对象代码
    const softwareObject = {
        id: newId,
        name: formData.name,
        description: formData.description,
        platform: formData.platform,
        icon: formData.icon,
        version: formData.version,
        size: formData.size,
        downloads: 0,
        downloadUrl: formData.downloadUrl,
        screenshots: [],
        category: formData.category,
        tags: tagsArray,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        lastUpdated: formData.lastUpdated
    };
    
    // 生成代码字符串
    const codeString = generateCodeString(softwareObject);
    
    // 显示生成的代码
    document.getElementById('generatedCode').textContent = codeString;
    document.getElementById('codeSection').style.display = 'block';
    
    // 滚动到代码区域
    document.getElementById('codeSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    showAlert('代码生成成功！请复制代码并添加到main.js文件中', 'success');
    
    // 重置表单
    setTimeout(() => {
        event.target.reset();
        // 重新设置默认值
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('lastUpdated').value = today;
        document.getElementById('softwareIcon').value = 'fas fa-desktop';
    }, 1000);
}

// 生成新的ID
function generateNewId() {
    if (softwareData.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...softwareData.map(item => item.id));
    return maxId + 1;
}

// 生成代码字符串
function generateCodeString(softwareObject) {
    return `{
    id: ${softwareObject.id},
    name: "${softwareObject.name}",
    description: "${softwareObject.description}",
    platform: "${softwareObject.platform}",
    icon: "${softwareObject.icon}",
    version: "${softwareObject.version}",
    size: "${softwareObject.size}",
    downloads: 0,
    downloadUrl: "${softwareObject.downloadUrl}",
    screenshots: [],
    category: "${softwareObject.category}",
    tags: ${JSON.stringify(softwareObject.tags)},${softwareObject.rating ? `
    rating: ${softwareObject.rating},` : ''}
    lastUpdated: "${softwareObject.lastUpdated}"
}`;
}

// 复制代码到剪贴板
function copyCode() {
    const codeElement = document.getElementById('generatedCode');
    const code = codeElement.textContent;
    
    // 创建临时文本域
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showAlert('代码已复制到剪贴板！', 'success');
        
        // 更新按钮文本
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    } catch (err) {
        showAlert('复制失败，请手动选择复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 加载当前软件列表
function loadCurrentSoftware() {
    const container = document.getElementById('currentSoftwareList');
    
    if (!softwareData || softwareData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>暂无软件</h3>
                <p>开始添加您的第一个软件吧！</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = softwareData.map(software => `
        <div class="software-item">
            <div class="software-info-admin">
                <i class="${software.icon}"></i>
                <div class="software-details">
                    <h4>${software.name}</h4>
                    <p>${software.description}</p>
                </div>
            </div>
            <div class="software-meta-admin">
                <span>版本: ${software.version}</span>
                <span>平台: ${getPlatformName(software.platform)}</span>
                <span>大小: ${software.size}</span>
                <span>下载: ${formatNumber(software.downloads || 0)}</span>
            </div>
        </div>
    `).join('');
}

// 显示提示信息
function showAlert(message, type = 'info') {
    // 移除现有提示
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 插入到登录表单或上传表单之前
    const loginForm = document.querySelector('.login-form');
    const uploadForm = document.querySelector('.upload-form');
    
    if (loginForm && document.getElementById('loginContainer').style.display !== 'none') {
        loginForm.parentNode.insertBefore(alert, loginForm);
    } else if (uploadForm) {
        uploadForm.parentNode.insertBefore(alert, uploadForm);
    }
    
    // 3秒后自动移除
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 3000);
}

// 工具函数
function getPlatformName(platform) {
    const names = {
        windows: 'Windows',
        macos: 'macOS',
        linux: 'Linux',
        mobile: '移动端'
    };
    return names[platform] || platform;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 防止未登录时直接访问
window.addEventListener('beforeunload', function() {
    // 清理敏感信息（可选）
});

// 安全性增强：检测开发者工具
let devtools = {
    open: false,
    orientation: null
};

const threshold = 160;

setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
            devtools.open = true;
            console.clear();
            console.log('%c⚠️ 安全提醒', 'color: red; font-size: 20px; font-weight: bold;');
            console.log('%c请注意保护管理员密码的安全！', 'color: orange; font-size: 14px;');
        }
    } else {
        devtools.open = false;
    }
}, 500);

// 禁用右键菜单（可选）
document.addEventListener('contextmenu', function(e) {
    if (localStorage.getItem('admin_logged_in') === 'true') {
        // 如果是管理员模式，可以考虑禁用右键
        // e.preventDefault();
    }
});