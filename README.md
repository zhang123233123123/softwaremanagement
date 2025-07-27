# 软件管理平台 🚀

一个现代化的软件下载和管理平台，支持多平台软件分发。

## 🌟 平台特色

- **多平台支持**: Windows、macOS、Linux、移动端
- **现代化界面**: 响应式设计，支持移动端访问
- **安全可靠**: 所有软件经过安全检测
- **高速下载**: CDN加速，提供极速下载体验
- **便捷管理**: 分类清晰，搜索功能强大

## 🎯 在线访问

访问地址: [https://zhang123233123123.github.io/softwaremanagement](https://zhang123233123123.github.io/softwaremanagement)

## 📁 项目结构

```
softwaremanagement/
├── index.html              # 主页
├── assets/                 # 静态资源
│   ├── css/
│   │   └── style.css      # 主样式文件
│   ├── js/
│   │   └── main.js        # 交互功能
│   └── images/
│       ├── logos/         # 软件图标
│       └── screenshots/   # 软件截图
├── software/              # 软件文件
│   ├── windows/          # Windows软件
│   ├── macos/            # macOS软件
│   ├── linux/            # Linux软件
│   └── mobile/           # 移动端应用
├── docs/                 # 文档
│   ├── installation/     # 安装指南
│   ├── user-guides/      # 使用指南
│   └── changelogs/       # 更新日志
└── README.md             # 项目说明
```

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/zhang123233123123/softwaremanagement.git
cd softwaremanagement
```

### 2. 启用GitHub Pages
1. 进入仓库设置页面
2. 滚动到 "Pages" 部分
3. 选择 "Deploy from a branch"
4. 选择 `main` 分支
5. 点击保存

### 3. 访问网站
几分钟后，您的网站将在以下地址可用:
```
https://zhang123233123123.github.io/softwaremanagement
```

## 📦 上传软件

### 1. 添加软件文件
将软件文件放置在对应的平台文件夹中:
```bash
software/
├── windows/your-app/setup.exe
├── macos/your-app/installer.dmg
├── linux/your-app/package.deb
└── mobile/your-app/app.apk
```

### 2. 更新软件配置
编辑 `assets/js/main.js` 中的 `softwareData` 数组，添加新的软件信息:

```javascript
{
    id: 9,
    name: "您的软件名称",
    description: "软件描述",
    platform: "windows", // windows, macos, linux, mobile
    icon: "fas fa-desktop", // FontAwesome图标
    version: "1.0.0",
    size: "50.2 MB",
    downloads: 0,
    downloadUrl: "software/windows/your-app/setup.exe",
    screenshots: [] // 可选的截图数组
}
```

### 3. 添加软件说明
为每个软件创建 `README.md` 文件:
```bash
software/windows/your-app/README.md
```

## 🎨 自定义配置

### 修改主题颜色
编辑 `assets/css/style.css` 中的CSS变量:
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    /* 更多颜色配置... */
}
```

### 更新网站信息
修改 `index.html` 中的网站标题、描述等信息。

## 🛠️ 管理工具

### 批量上传脚本
创建 `upload-helper.py` 脚本来简化软件上传流程:

```python
#!/usr/bin/env python3
import os
import json
import shutil

def upload_software(name, platform, file_path, description, version):
    """上传软件的辅助函数"""
    # 创建软件目录
    software_dir = f"software/{platform}/{name}"
    os.makedirs(software_dir, exist_ok=True)
    
    # 复制文件
    filename = os.path.basename(file_path)
    shutil.copy2(file_path, f"{software_dir}/{filename}")
    
    # 生成README
    readme_content = f"""# {name}

## 软件信息
- **名称**: {name}
- **版本**: {version}
- **平台**: {platform}

## 软件描述
{description}

## 安装说明
请参考平台相关的安装指南。
"""
    
    with open(f"{software_dir}/README.md", "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    print(f"✅ {name} 上传完成!")

# 使用示例
# upload_software("MyApp", "windows", "/path/to/setup.exe", "我的应用", "1.0.0")
```

## 📊 统计数据

平台自动统计以下数据:
- 软件总数
- 各平台软件数量
- 下载统计
- 用户访问量

## 🔧 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **图标**: Font Awesome 6
- **托管**: GitHub Pages
- **构建**: 无需构建，纯静态网站

## 📱 响应式设计

网站完全响应式，支持:
- 桌面端 (1200px+)
- 平板端 (768px - 1199px)
- 移动端 (320px - 767px)

## 🔒 安全特性

- GitHub Pages HTTPS 加密
- 文件完整性验证
- 无服务器端代码，安全可靠

## 🚀 性能优化

- CSS/JS 文件压缩
- 图片懒加载
- CDN 加速
- 缓存策略优化

## 📈 SEO 优化

- 语义化HTML结构
- Meta标签优化
- 结构化数据
- 网站地图支持

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- GitHub Issues: [提交问题](https://github.com/zhang123233123123/softwaremanagement/issues)
- Email: support@example.com

## 🙏 致谢

感谢以下开源项目:
- [Font Awesome](https://fontawesome.com/) - 图标库
- [GitHub Pages](https://pages.github.com/) - 静态网站托管

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！