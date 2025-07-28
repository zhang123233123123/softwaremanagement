// 管理员后台JavaScript

// 管理员密码（实际使用时应该加密存储）
const ADMIN_PASSWORD = 'admin123456'; // 请修改为您的密码

// 全局变量
let uploadedFiles = {
    software: null,
    readme: null
};

// 检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadCurrentSoftware();
    setupFileUpload();
    
    // 从localStorage恢复GitHub Token
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        document.getElementById('githubToken').value = savedToken;
    }
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

// 设置文件上传
function setupFileUpload() {
    // 软件文件上传
    const softwareFileInput = document.getElementById('softwareFile');
    const softwareFileArea = document.getElementById('softwareFileArea');
    
    setupFileDropArea(softwareFileArea, softwareFileInput, 'software');
    
    softwareFileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files[0], 'software');
    });
    
    // README文件上传
    const readmeFileInput = document.getElementById('readmeFile');
    const readmeFileArea = document.getElementById('readmeFileArea');
    
    setupFileDropArea(readmeFileArea, readmeFileInput, 'readme');
    
    readmeFileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files[0], 'readme');
    });
}

// 设置文件拖拽区域
function setupFileDropArea(area, input, type) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, unhighlight, false);
    });

    area.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFileSelect(files[0], type);
        }
    }, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        area.classList.add('drag-over');
    }

    function unhighlight(e) {
        area.classList.remove('drag-over');
    }
}

// 处理文件选择
function handleFileSelect(file, type) {
    if (!file) return;
    
    uploadedFiles[type] = file;
    
    // 显示文件信息
    const fileInfoId = type === 'software' ? 'softwareFileInfo' : 'readmeFileInfo';
    const fileInfo = document.getElementById(fileInfoId);
    
    fileInfo.innerHTML = `
        <i class="fas fa-file"></i>
        <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <button type="button" class="file-remove" onclick="removeFile('${type}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    fileInfo.style.display = 'flex';
    
    // 如果是软件文件，自动填充文件大小
    if (type === 'software') {
        document.getElementById('softwareSize').value = formatFileSize(file.size);
    }
}

// 移除文件
function removeFile(type) {
    uploadedFiles[type] = null;
    
    const fileInfoId = type === 'software' ? 'softwareFileInfo' : 'readmeFileInfo';
    const fileInfo = document.getElementById(fileInfoId);
    fileInfo.style.display = 'none';
    
    const inputId = type === 'software' ? 'softwareFile' : 'readmeFile';
    document.getElementById(inputId).value = '';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理软件上传
async function handleSoftwareUpload(event) {
    event.preventDefault();
    
    // 验证文件
    if (!uploadedFiles.software) {
        showAlert('请选择软件文件！', 'error');
        return;
    }
    
    // 获取GitHub Token
    const githubToken = document.getElementById('githubToken').value.trim();
    if (!githubToken) {
        showAlert('请输入GitHub Personal Access Token！', 'error');
        return;
    }
    
    // 保存Token到localStorage
    localStorage.setItem('github_token', githubToken);
    
    // 获取表单数据
    const formData = {
        name: document.getElementById('softwareName').value.trim(),
        version: document.getElementById('softwareVersion').value.trim(),
        description: document.getElementById('softwareDescription').value.trim(),
        platform: document.getElementById('softwarePlatform').value,
        category: document.getElementById('softwareCategory').value || 'other',
        icon: document.getElementById('softwareIcon').value.trim() || 'fas fa-desktop',
        tags: document.getElementById('softwareTags').value.trim(),
        rating: document.getElementById('softwareRating').value || null
    };
    
    // 验证必填字段
    if (!formData.name || !formData.version || !formData.description || !formData.platform) {
        showAlert('请填写所有必填字段！', 'error');
        return;
    }
    
    // 显示上传进度
    const uploadBtn = document.querySelector('.upload-btn');
    const originalBtnText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在上传...';
    uploadBtn.disabled = true;
    
    try {
        // 上传到GitHub
        await uploadToGitHub(githubToken, formData);
        
        showAlert('软件上传成功！正在自动部署...', 'success');
        
        // 重置表单
        setTimeout(() => {
            event.target.reset();
            uploadedFiles = { software: null, readme: null };
            document.getElementById('softwareFileInfo').style.display = 'none';
            document.getElementById('readmeFileInfo').style.display = 'none';
            document.getElementById('softwareIcon').value = 'fas fa-desktop';
            
            // 恢复GitHub Token
            document.getElementById('githubToken').value = githubToken;
        }, 2000);
        
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('上传失败：' + error.message, 'error');
    } finally {
        uploadBtn.innerHTML = originalBtnText;
        uploadBtn.disabled = false;
    }
}

// 上传到GitHub
async function uploadToGitHub(token, formData) {
    const repoOwner = 'zhang123233123123';
    const repoName = 'softwaremanagement';
    const branch = 'main';
    
    // 创建软件目录路径
    const softwarePath = `software/${formData.platform}/${formData.name.toLowerCase().replace(/\s+/g, '-')}`;
    const softwareFileName = uploadedFiles.software.name;
    const readmeFileName = 'README.md';
    
    // 上传软件文件
    const softwareFileContent = await fileToBase64(uploadedFiles.software);
    await uploadFileToGitHub(token, repoOwner, repoName, `${softwarePath}/${softwareFileName}`, softwareFileContent);
    
    // 上传README文件（如果有）
    if (uploadedFiles.readme) {
        const readmeContent = await readFileAsText(uploadedFiles.readme);
        await uploadFileToGitHub(token, repoOwner, repoName, `${softwarePath}/${readmeFileName}`, btoa(unescape(encodeURIComponent(readmeContent))));
    }
    
    // 生成新的软件数据
    const newId = generateNewId();
    const tagsArray = formData.tags ? 
        formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
    const newSoftware = {
        id: newId,
        name: formData.name,
        description: formData.description,
        platform: formData.platform,
        icon: formData.icon,
        version: formData.version,
        size: formatFileSize(uploadedFiles.software.size),
        downloads: 0,
        downloadUrl: `${softwarePath}/${softwareFileName}`,
        screenshots: [],
        category: formData.category,
        tags: tagsArray,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // 更新main.js文件
    await updateMainJS(token, repoOwner, repoName, newSoftware);
}

// 将文件转换为Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// 读取文件为文本
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 上传文件到GitHub
async function uploadFileToGitHub(token, owner, repo, path, content) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Add ${path}`,
            content: content,
            branch: 'main'
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
    }
    
    return response.json();
}

// 更新main.js文件
async function updateMainJS(token, owner, repo, newSoftware) {
    const mainJSPath = 'assets/js/main.js';
    
    // 获取当前main.js文件
    const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${mainJSPath}`, {
        headers: {
            'Authorization': `token ${token}`,
        }
    });
    
    if (!getResponse.ok) {
        throw new Error('Failed to get main.js file');
    }
    
    const fileData = await getResponse.json();
    const currentContent = atob(fileData.content);
    
    // 在softwareData数组中添加新软件
    const softwareDataRegex = /(const softwareData = \[)([\s\S]*?)(\];)/;
    const match = currentContent.match(softwareDataRegex);
    
    if (!match) {
        throw new Error('Could not find softwareData array in main.js');
    }
    
    const beforeArray = match[1];
    const arrayContent = match[2];
    const afterArray = match[3];
    
    // 生成新软件对象的代码
    const newSoftwareCode = generateCodeString(newSoftware);
    
    // 构建新的数组内容
    let newArrayContent;
    if (arrayContent.trim() === '' || arrayContent.trim().startsWith('//')) {
        // 如果数组为空或只有注释，直接添加
        newArrayContent = `\n    ${newSoftwareCode}\n`;
    } else {
        // 如果数组有内容，在末尾添加
        newArrayContent = arrayContent.replace(/\n$/, '') + `,\n    ${newSoftwareCode}\n`;
    }
    
    const newContent = beforeArray + newArrayContent + afterArray;
    
    // 上传更新后的main.js
    const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${mainJSPath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Add new software: ${newSoftware.name}`,
            content: btoa(unescape(encodeURIComponent(newContent))),
            sha: fileData.sha,
            branch: 'main'
        })
    });
    
    if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to update main.js');
    }
    
    return updateResponse.json();
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