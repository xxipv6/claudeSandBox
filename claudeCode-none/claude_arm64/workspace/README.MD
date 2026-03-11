## 🔧 Claude Code 配置与插件安装指南（优化排版版）

---

### 一、API 配置修改

📂 **配置文件路径**
```bash
/root/.claude/
```

🛠 **操作说明**
- 进入上述目录  
- 根据实际需求修改 API 相关参数  
- 保存配置文件即可生效  

---

### 二、插件安装流程

#### 1️⃣ 进入 Claude Code 插件管理
在 Claude Code 命令行中输入：
```bash
/plugin
```

#### 2️⃣ 添加官方插件市场
按以下路径操作：
```text
Marketplaces → Add Marketplace
```

输入官方插件仓库地址：
```text
anthropics/claude-plugins-official
```

#### 3️⃣ 安装所需插件
- 切换至 **Discover** 标签页  
- 搜索目标插件  
- 点击安装完成部署  

#### 4️⃣ 重启 Claude Code
🔄 插件安装完成后，**必须重启 Claude Code** 才能生效  

---

### 三、开启 Bypass 模式（防止插件崩溃）

⚠️ **仅建议在无公网访问的沙箱环境中启用**

进入 **插件设置（Plugin Settings）**，进行如下配置：

#### ✅ 启用权限跳过模式
```text
Claude Code: Allow Dangerously Skip Permissions
```

说明：
> Allow bypass permissions mode. Recommended only for sandboxes with no internet access.

#### ✏️ 修改初始权限模式
```text
Claude Code: Initial Permission Mode
```

设置为：
```text
acceptEdits
```

---

📌 **注意事项**
- Bypass 模式可有效避免插件因权限校验导致的异常或崩溃  
- 不建议在生产环境或联网环境中启用  

---
