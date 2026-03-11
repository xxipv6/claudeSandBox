# Frontend-Engineer Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 FRONTEND-ENGINEER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Frontend-Engineer 使用指引

**分析前**：
- 快速浏览 patterns.md 的"边界类"、"信任类"模式
- 参考 domains.md 的"边界"、"信任"、"输入"维度

**分析中**：
- 重点关注：输入面、交互路径、攻击面
- 对照 corrections.md 避免重复错误

**分析后**：
- 检查是否遗漏了常见的前端安全风险
- 将新发现的模式记录到 corrections.md

---

## 分析重点

### 输入面分析
- 用户可以输入哪些字段？
- 每个字段的类型、范围、约束是什么？
- 是否存在未校验或校验宽松的输入？

### 交互路径分析
- 用户可以进行哪些操作？
- 操作的顺序是否有限制？
- 是否存在可跳过的步骤？

### 权限与边界分析
- 用户权限的边界在哪里？
- 前端是否正确展示了权限边界？
- 是否存在前端权限但后端未授权的情况？

### 攻击面分析
- 恶意用户可以通过 UI 做什么？
- 是否存在未授权的操作路径？
- 是否存在信息泄露风险？

---

## 常见前端安全风险

### XSS（跨站脚本）
- 直接渲染用户输入
- 使用 dangerouslySetInnerHTML 不清理
- URL 参数注入

### CSRF（跨站请求伪造）
- 写操作缺少 CSRF token
- 缺少 SameSite cookie

### 信息泄露
- 错误消息泄露系统细节
- 调试信息暴露
- 敏感数据存储在 localStorage

---

## 输出要求

必须输出结构化分析，包括：
- 输入面清单
- 攻击面分析
- 交互路径分析
- 权限边界分析
- 安全风险评估

---

## 持续改进

每次分析后，思考：
1. 是否发现了新的前端安全风险模式？
2. 是否应该更新 corrections.md？
3. 是否应该更新 patterns.md？
