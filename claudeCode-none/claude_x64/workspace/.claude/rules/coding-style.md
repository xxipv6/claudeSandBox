---
paths:
  - "**/*.{js,ts,jsx,tsx,py,go}"
---

# 代码风格规范

## 命名规范

### 变量和函数
- 使用 camelCase: `getUserById`, `handleSubmit`
- 名字要有意义，避免缩写
- 布尔值使用 is/has/should 前缀: `isValid`, `hasPermission`

### 常量
- 使用 UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`, `API_BASE_URL`

### 类
- 使用 PascalCase: `UserService`, `AuthenticationMiddleware`

### 文件
- 使用 kebab-case: `user-service.js`, `api-handler.js`

## 代码组织

### 文件结构
```javascript
// 1. 导入
const express = require('express');
const { User } = require('./models');

// 2. 常量
const MAX_USERS = 100;

// 3. 函数定义
function getUserById(id) {
  // ...
}

// 4. 导出
module.exports = { getUserById };
```

### 函数长度
- 函数不超过 50 行
- 超过则拆分为更小的函数

### 注释
- 复杂逻辑必须添加注释
- 注释说明"为什么"而非"是什么"

## 格式规范

### 缩进
- 使用 2 空格（JavaScript/TypeScript）
- 使用 4 空格（Python）

### 行宽
- 每行不超过 80 字符

### 尾随逗号
- 多行对象/数组使用尾随逗号

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3,
};
```

## 最佳实践

### 使用现代语法
- 优先使用 const/let 而非 var
- 使用箭头函数
- 使用模板字符串
- 使用解构赋值

### 错误处理
- 始终处理错误
- 使用 try-catch
- 不要忽略 Promise rejection

### 代码复用
- DRY 原则（Don't Repeat Yourself）
- 提取公共逻辑
- 使用工具函数

## 检查工具

使用 ESLint/Pylint/golangci-lint 自动检查代码风格。
