#!/usr/bin/env python3
"""
软件上传辅助脚本
用于简化软件上传和配置更新流程
"""

import os
import json
import shutil
import hashlib
from datetime import datetime
from pathlib import Path

class SoftwareUploader:
    def __init__(self, project_root="."):
        self.project_root = Path(project_root)
        self.software_dir = self.project_root / "software" 
        self.js_file = self.project_root / "assets" / "js" / "main.js"
        
    def get_file_size(self, file_path):
        """获取文件大小的人类可读格式"""
        size_bytes = os.path.getsize(file_path)
        
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
    
    def get_file_hash(self, file_path):
        """计算文件MD5哈希值"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def create_software_entry(self, name, platform, file_path, description, version, icon="fas fa-desktop"):
        """创建新的软件条目"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        # 创建软件目录
        software_name = name.lower().replace(" ", "-")
        target_dir = self.software_dir / platform / software_name
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # 复制文件
        target_file = target_dir / file_path.name
        shutil.copy2(file_path, target_file)
        
        # 获取文件信息
        file_size = self.get_file_size(target_file)
        file_hash = self.get_file_hash(target_file)
        
        # 生成软件配置
        software_entry = {
            "name": name,
            "description": description,
            "platform": platform,
            "icon": icon,
            "version": version,
            "size": file_size,
            "downloads": 0,
            "downloadUrl": f"software/{platform}/{software_name}/{file_path.name}",
            "screenshots": [],
            "hash": file_hash,
            "uploadDate": datetime.now().isoformat(),
            "filename": file_path.name
        }
        
        # 创建README文件
        self.create_readme(target_dir, software_entry)
        
        print(f"✅ {name} 已成功上传到 {platform} 平台")
        print(f"📁 目录: {target_dir}")
        print(f"📦 大小: {file_size}")
        print(f"🔒 MD5: {file_hash}")
        
        return software_entry
    
    def create_readme(self, target_dir, software_info):
        """为软件创建README文件"""
        platform_install_guides = {
            "windows": """## 安装说明
1. 下载安装包
2. 双击运行安装程序
3. 按照安装向导完成安装
4. 运行程序并按需配置""",
            
            "macos": """## 安装说明
1. 下载DMG文件
2. 双击挂载磁盘映像
3. 将应用拖拽到Applications文件夹
4. 首次运行时可能需要在系统偏好设置中允许运行""",
            
            "linux": """## 安装说明

### Ubuntu/Debian系统
```bash
sudo dpkg -i {filename}
sudo apt-get install -f
```

### CentOS/RHEL系统
```bash
sudo rpm -i {filename}
```

### 通用安装
```bash
tar -xzf {filename}
cd extracted-directory
./install.sh
```""",
            
            "mobile": """## 安装说明

### Android
1. 下载APK文件
2. 在设置中允许安装未知来源应用
3. 点击APK文件完成安装

### iOS
1. 通过App Store下载
2. 或通过TestFlight安装测试版"""
        }
        
        readme_content = f"""# {software_info['name']}

## 软件信息
- **名称**: {software_info['name']}
- **版本**: {software_info['version']}
- **大小**: {software_info['size']}
- **平台**: {software_info['platform'].title()}
- **上传日期**: {datetime.fromisoformat(software_info['uploadDate']).strftime('%Y-%m-%d %H:%M:%S')}
- **文件MD5**: {software_info['hash']}

## 软件描述
{software_info['description']}

{platform_install_guides.get(software_info['platform'], '## 安装说明\\n请参考相关平台的安装指南。')}

## 更新日志
### {software_info['version']} ({datetime.now().strftime('%Y-%m-%d')})
- 版本发布

## 技术支持
如有问题，请通过GitHub Issues联系技术支持。

---
*此文件由软件上传助手自动生成*
"""
        
        readme_path = target_dir / "README.md"
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(readme_content.format(filename=software_info['filename']))
    
    def update_js_config(self, software_entry):
        """更新JavaScript配置文件"""
        if not self.js_file.exists():
            print(f"❌ JavaScript文件不存在: {self.js_file}")
            return
        
        # 读取现有文件
        with open(self.js_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 找到softwareData数组的位置
        start_marker = "const softwareData = ["
        end_marker = "];"
        
        start_idx = content.find(start_marker)
        if start_idx == -1:
            print("❌ 未找到softwareData配置")
            return
        
        end_idx = content.find(end_marker, start_idx)
        if end_idx == -1:
            print("❌ 配置格式错误")
            return
        
        # 提取现有数据
        data_section = content[start_idx + len(start_marker):end_idx].strip()
        
        # 生成新的条目
        new_entry = f"""    {{
        id: {self.get_next_id(content)},
        name: "{software_entry['name']}",
        description: "{software_entry['description']}",
        platform: "{software_entry['platform']}",
        icon: "{software_entry['icon']}",
        version: "{software_entry['version']}",
        size: "{software_entry['size']}",
        downloads: {software_entry['downloads']},
        downloadUrl: "{software_entry['downloadUrl']}",
        screenshots: {json.dumps(software_entry['screenshots'])}
    }}"""
        
        # 更新内容
        if data_section.strip():
            new_data = data_section.rstrip().rstrip(',') + ',\n' + new_entry
        else:
            new_data = '\n' + new_entry + '\n'
        
        new_content = content[:start_idx + len(start_marker)] + new_data + '\n' + content[end_idx:]
        
        # 写入文件
        with open(self.js_file, "w", encoding="utf-8") as f:
            f.write(new_content)
        
        print(f"✅ JavaScript配置已更新")
    
    def get_next_id(self, js_content):
        """获取下一个可用的ID"""
        import re
        id_pattern = r'id:\s*(\d+)'
        ids = [int(match.group(1)) for match in re.finditer(id_pattern, js_content)]
        return max(ids) + 1 if ids else 1
    
    def list_software(self):
        """列出所有已上传的软件"""
        print("\n📦 已上传的软件:")
        print("-" * 80)
        
        for platform_dir in self.software_dir.iterdir():
            if platform_dir.is_dir():
                platform = platform_dir.name
                print(f"\n🖥️  {platform.upper()}:")
                
                for software_dir in platform_dir.iterdir():
                    if software_dir.is_dir():
                        readme_path = software_dir / "README.md"
                        if readme_path.exists():
                            # 简单解析README获取信息
                            with open(readme_path, "r", encoding="utf-8") as f:
                                content = f.read()
                                name_match = re.search(r'\*\*名称\*\*: (.+)', content)
                                version_match = re.search(r'\*\*版本\*\*: (.+)', content)
                                size_match = re.search(r'\*\*大小\*\*: (.+)', content)
                                
                                name = name_match.group(1) if name_match else software_dir.name
                                version = version_match.group(1) if version_match else "未知"
                                size = size_match.group(1) if size_match else "未知"
                                
                                print(f"  📁 {name} (v{version}) - {size}")
    
    def remove_software(self, platform, software_name):
        """删除软件"""
        software_path = self.software_dir / platform / software_name.lower().replace(" ", "-")
        
        if not software_path.exists():
            print(f"❌ 软件不存在: {software_path}")
            return
        
        # 删除文件夹
        shutil.rmtree(software_path)
        print(f"✅ 已删除软件: {software_name}")
        print("⚠️  请手动从JavaScript配置中移除相应条目")

def main():
    """主函数 - 命令行界面"""
    uploader = SoftwareUploader()
    
    print("🚀 软件管理平台 - 上传助手")
    print("=" * 50)
    
    while True:
        print("\n选择操作:")
        print("1. 上传新软件")
        print("2. 列出已有软件") 
        print("3. 删除软件")
        print("4. 退出")
        
        choice = input("\n请输入选项 (1-4): ").strip()
        
        if choice == "1":
            try:
                name = input("软件名称: ").strip()
                description = input("软件描述: ").strip()
                platform = input("平台 (windows/macos/linux/mobile): ").strip().lower()
                version = input("版本号: ").strip()
                file_path = input("文件路径: ").strip()
                icon = input("图标 (默认: fas fa-desktop): ").strip() or "fas fa-desktop"
                
                if platform not in ["windows", "macos", "linux", "mobile"]:
                    print("❌ 无效的平台选择")
                    continue
                
                software_entry = uploader.create_software_entry(
                    name, platform, file_path, description, version, icon
                )
                
                update_js = input("是否更新JavaScript配置? (y/N): ").strip().lower()
                if update_js == 'y':
                    uploader.update_js_config(software_entry)
                    
            except Exception as e:
                print(f"❌ 错误: {e}")
        
        elif choice == "2":
            uploader.list_software()
        
        elif choice == "3":
            platform = input("平台: ").strip().lower()
            software_name = input("软件名称: ").strip()
            uploader.remove_software(platform, software_name)
        
        elif choice == "4":
            print("👋 再见!")
            break
        
        else:
            print("❌ 无效选择")

if __name__ == "__main__":
    main()