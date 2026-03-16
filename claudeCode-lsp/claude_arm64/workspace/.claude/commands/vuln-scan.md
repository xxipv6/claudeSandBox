---
description: 快速扫描代码中的已知漏洞和安全隐患
---

# 漏洞扫描

## 扫描类型

### 1. 静态代码扫描

**检查项目**：
- 硬编码密钥和凭据
- SQL 注入模式
- XSS 漏洞模式
- 不安全的函数调用
- 缺少输入验证
- 不安全的随机数生成
- 弱加密算法

**工具**：
- 代码模式匹配
- 正则表达式搜索
- 数据流分析

### 2. 依赖漏洞扫描

**检查项目**：
- package.json / requirements.txt / go.mod
- 已知 CVE 漏洞
- 过时的依赖版本
- 有漏洞的传递依赖

**工具**：
- `npm audit`
- `cargo audit`
- `safety check` (Python)
- `go list -json -m all`

### 3. 配置安全扫描

**检查项目**：
- 不安全的配置选项
- 暴露的敏感信息
- 弱密码策略
- 不安全的文件权限
- 调试模式开启

## 扫描流程

### 第一步：快速扫描（30 秒）

```bash
# 检查常见问题模式
1. 硬编码密钥：搜索 password, api_key, secret 等
2. SQL 注入：搜索拼接 SQL 的模式
3. XSS：搜索 innerHTML, eval 等
4. 不安全加密：搜索 md5, sha1 等
```

### 第二步：依赖检查（1 分钟）

```bash
# 运行依赖审计工具
- npm: npm audit
- yarn: yarn audit
- python: safety check
- go: go list -json -m all | go-vulncheck
```

### 第三步：深度扫描（可选）

对于快速扫描发现的可疑点，进行深度分析：
- 数据流追踪
- 控制流分析
- 上下文理解

## 使用示例

```bash
# 扫描整个项目
/vuln-scan

# 扫描特定目录
/vuln-scan src/auth/

# 只扫描依赖
/vuln-scan --deps-only

# 快速扫描（跳过依赖）
/vuln-scan --quick
```

## 输出格式

```
## 漏洞扫描报告

### 摘要
- 代码问题：X 个
- 依赖漏洞：Y 个
- 配置问题：Z 个

### 代码问题
1. [高危] 硬编码密钥 - config/database.js:12
   - 发现：`password: "admin123"`
   - 建议：使用环境变量

2. [中危] SQL 注入风险 - api/users.js:45
   - 发现：`SELECT * FROM users WHERE id = ${req.params.id}`
   - 建议：使用参数化查询

### 依赖漏洞
1. [高危] lodash < 4.17.21 (CVE-2021-23337)
   - 修复：升级到 4.17.21 或更高
   - 命令：npm update lodash

### 配置问题
1. [中危] 调试模式开启 - .env:3
   - 发现：DEBUG=true
   - 建议：生产环境设置为 false
```

## 快速修复

扫描后，可以自动修复一些问题：

```bash
# 修复依赖漏洞
/vuln-scan --fix

# 生成修复脚本
/vuln-scan --fix-script
```

## 注意事项

- 扫描是辅助工具，不能替代人工审查
- 可能存在误报，需要验证
- 修复后重新扫描确认
- 优先修复高危漏洞
- 保持依赖更新
