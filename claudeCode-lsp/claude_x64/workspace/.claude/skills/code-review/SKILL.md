---
name: code-review
description: 代码审查方法论、审查清单、常见问题和最佳实践。当需要审查代码质量、检查架构边界、识别潜在问题时，应主动（PROACTIVELY）使用此 skill。
disable-model-invocation: false
---

# 代码审查技能 (Code Review Skills)

## 何时激活 (When to Activate)

- PR/MR 提交需要审查时
- 代码合并前的质量检查时
- 需要确保代码符合团队规范时
- 需要发现潜在问题时
- 需要知识分享和指导时

---

## 代码审查原则 (Code Review Principles)

### 1. 目标明确

代码审查的主要目标：
- ✅ **发现缺陷和潜在问题**
- ✅ **确保代码符合团队标准**
- ✅ **知识共享和学习**
- ✅ **维护架构一致性**
- ❌ **不是**：证明作者能力不足
- ❌ **不是**：强制个人风格偏好

### 2. 审查者心态

**正确的态度**：
- 建设性反馈，尊重作者
- 解释"为什么"，不只是"是什么"
- 接受合理建议
- 关注代码，不关注人
- 学习新方法和模式

**避免的态度**：
- 批评和贬低
- 固执己见
- 个人攻击
- 完美主义（阻碍进度）

### 3. 审查时机

- **小批量频繁审查** > 大批量偶尔审查
- PR 不超过 400 行代码
- 审查不超过 1 小时
- 及时响应（24 小时内）

---

## 审查流程 (Review Process)

### 阶段 1：准备 (Preparation)

1. **理解上下文**
   - 阅读 PR 描述
   - 了解需求和目的
   - 查看相关 issue

2. **拉取代码**
   ```bash
   git fetch origin
   git checkout feature-branch
   ```

3. **本地验证（可选）**
   ```bash
   # 运行测试
   npm test
   # 或
   pytest

   # 检查 lint
   npm run lint
   # 或
   flake8
   ```

### 阶段 2：初步审查 (Initial Review)

1. **快速浏览**
   - 整体结构是否合理
   - 是否有明显的架构问题
   - 是否符合需求

2. **关注大问题**
   - 架构设计
   - 安全问题
   - 性能问题
   - 可维护性

### 阶段 3：详细审查 (Detailed Review)

1. **逐文件审查**
   - 按逻辑顺序（通常从入口开始）
   - 理解每个文件的职责

2. **逐函数/方法审查**
   - 功能是否正确
   - 边界条件是否处理
   - 错误是否处理
   - 命名是否清晰

3. **添加评论**
   - 使用建设性语言
   - 提供具体建议
   - 必要时添加代码示例

### 阶段 4：反馈与讨论 (Feedback & Discussion)

1. **分类评论**
   - 🔴 **必须修复**（Blocker）：Bug、安全问题
   - 🟡 **建议修复**（Suggestion）：性能、可读性
   - 🔵 **讨论**（Question）：不确认的设计选择
   - 💡 **称赞**（Praise）：好的实现

2. **响应讨论**
   - 作者回应评论
   - 讨论解决方案
   - 达成共识或升级

### 阶段 5：验证与合并 (Verify & Merge)

1. **验证修复**
   - 作者更新代码
   - 审查者确认修复
   - 更新 PR 状态

2. **合并**
   - 所有必须修复项已解决
   - CI 通过
   - 合并到目标分支

---

## 审查清单 (Review Checklist)

### 功能正确性 (Functionality)

- [ ] 代码实现了 PR 描述的功能
- [ ] 边界条件已处理
- [ ] 错误情况已处理
- [ ] 没有明显的逻辑错误
- [ ] 单元测试覆盖核心逻辑

### 代码质量 (Code Quality)

- [ ] 命名清晰且一致
- [ ] 函数/方法职责单一
- [ ] 没有重复代码（DRY）
- [ ] 没有死代码或注释代码
- [ ] 复杂度合理（没有深层嵌套）

### 可读性 (Readability)

- [ ] 代码易于理解
- [ ] 注释解释"为什么"，不是"是什么"
- [ ] 复杂逻辑有注释
- [ ] 变量名自解释
- [ ] 遵循团队编码规范

### 架构与设计 (Architecture & Design)

- [ ] 符合项目架构
- [ ] 模块边界清晰
- [ ] 依赖关系合理
- [ ] 接口设计良好
- [ ] 没有过度设计

### 安全性 (Security)

- [ ] 输入已验证
- [ ] 输出已编码
- [ ] 敏感数据已保护
- [ ] 权限检查正确
- [ ] 没有安全漏洞

### 性能 (Performance)

- [ ] 没有明显的性能问题
- [ ] 数据库查询已优化
- [ ] 没有不必要的循环
- [ ] 大数据量已考虑
- [ ] 缓存使用得当（如需要）

### 测试 (Testing)

- [ ] 新功能有测试
- [ ] 测试覆盖主要场景
- [ ] 边界条件有测试
- [ ] 错误路径有测试
- [ ] 测试可维护

### 文档 (Documentation)

- [ ] 公共 API 有文档
- [ ] 复杂逻辑有注释
- [ ] README 已更新（如需要）
- [ ] 变更日志已更新（如需要）
- [ ] 注释准确且最新

### 向后兼容性 (Backward Compatibility)

- [ ] API 变更已说明
- [ ] 数据库迁移已提供
- [ ] 配置变更已文档化
- [ ] 弃用警告已添加

---

## 常见问题 (Common Issues)

### 1. 命名问题

#### ❌ 不好的命名
```python
def d(u):
    x = u['n']
    y = u['a']
    return x + y
```

#### ✅ 好的命名
```python
def calculate_total_age(user):
    name = user['name']
    age = user['age']
    return name, age
```

### 2. 函数过长

#### ❌ 问题
```python
def process_order(order):
    # 200 行代码
    # 验证订单
    # 检查库存
    # 计算价格
    # 创建支付
    # 发送邮件
    # 更新数据库
    # ...
```

#### ✅ 解决
```python
def process_order(order):
    validate_order(order)
    check_inventory(order)
    total = calculate_total(order)
    payment = create_payment(total)
    send_confirmation(order)
    update_order_status(order)
```

### 3. 嵌套过深

#### ❌ 问题
```python
if user:
    if user.is_active:
        if user.has_permission:
            if resource:
                if resource.is_accessible:
                    return process(user, resource)
```

#### ✅ 解决（提前返回）
```python
if not user:
    return None
if not user.is_active:
    return None
if not user.has_permission:
    return None
if not resource or not resource.is_accessible:
    return None
return process(user, resource)
```

### 4. 重复代码

#### ❌ 问题
```python
def process_user(user):
    if user.age < 18:
        send_email(user, "minor@example.com", "You are minor")
    else:
        send_email(user, "adult@example.com", "You are adult")

def process_admin(admin):
    if admin.age < 18:
        send_email(admin, "minor@example.com", "You are minor")
    else:
        send_email(admin, "adult@example.com", "You are adult")
```

#### ✅ 解决（提取函数）
```python
def send_age_email(person):
    if person.age < 18:
        send_email(person, "minor@example.com", "You are minor")
    else:
        send_email(person, "adult@example.com", "You are adult")

def process_user(user):
    send_age_email(user)

def process_admin(admin):
    send_age_email(admin)
```

### 5. 忽略错误

#### ❌ 问题
```python
try:
    result = api_call()
except:
    pass  # 静默忽略错误

# 或
result = api_call()  # 忽略返回的错误
```

#### ✅ 解决
```python
try:
    result = api_call()
except APIError as e:
    logger.error(f"API call failed: {e}")
    raise

# 或
result, err = api_call()
if err:
    logger.error(f"API call failed: {err}")
    return None
```

### 6. 魔法数字

#### ❌ 问题
```python
if user.age < 18:
    print("minor")

timeout = 86400  # 一天的秒数
```

#### ✅ 解决
```python
MINOR_AGE_THRESHOLD = 18

if user.age < MINOR_AGE_THRESHOLD:
    print("minor")

SECONDS_PER_DAY = 86400
timeout = SECONDS_PER_DAY
```

### 7. 不必要的注释

#### ❌ 问题
```python
# 增加年龄
age = age + 1

# 如果用户是管理员
if user.is_admin:
    ...
```

#### ✅ 解决（代码自解释）
```python
age += 1

if user.is_admin:
    ...
```

#### ✅ 保留的注释（解释"为什么"）
```python
# 使用 += 1 而不是 ++ 因为 Python 没有 ++ 操作符
age += 1

# 检查管理员权限，即使是管理员也需要验证二次认证
if user.is_admin and user.has_2fa:
    ...
```

---

## 评论模板 (Comment Templates)

### 🔴 必须修复（Blocker）

```markdown
🔴 **必须修复**

**问题**：[简短描述问题]

**位置**：[文件:行号]

**为什么**：[解释为什么这是问题]

**建议**：
```python
# 或其他语言
[提供修复代码示例]
```

**影响**：[如果不修复会怎样]
```

### 🟡 建议修复（Suggestion）

```markdown
🟡 **建议**

**观察**：[描述观察]

**位置**：[文件:行号]

**建议**：
```python
[提供改进代码示例]
```

**好处**：[改进后的好处]

**优先级**：[低/中/高]
```

### 🔵 讨论问题（Question）

```markdown
🔵 **讨论**

**问题**：[提出问题]

**位置**：[文件:行号]

**背景**：[为什么问这个问题]

**选项**：
1. 选项 A
2. 选项 B

**你的想法**？
```

### 💡 称赞（Praise）

```markdown
💡 **做得好**

**位置**：[文件:行号]

**为什么好**：[具体说明]

这是很好的 [设计/实现/方法]，因为 [原因]。
```

---

## 不同语言的审查要点

### Python

- [ ] 遵循 PEP 8
- [ ] 使用类型注解
- [ ] 异常处理具体
- [ ] 使用上下文管理器（with 语句）
- [ ] 列表推导式适当使用
- [ ] 避免全局变量
- [ ] `__init__.py` 适当使用

### JavaScript/TypeScript

- [ ] TypeScript 严格模式
- [ ] 使用 const/let（不用 var）
- [ ] 异步使用 async/await
- [ ] 避免嵌套回调
- [ ] 组件函数式 + Hooks
- [ ] Props 定义接口
- [ ] 避免使用 any

### Go

- [ ] 错误必须处理
- [ ] 使用 gofmt
- [ ] 接口优先
- [ ] goroutine 适当使用
- [ ] 通道优先于共享内存
- [ ] defer 用于资源清理
- [ ] 结构体字段导出明确

### Java

- [ ] 遵循 Java 命名约定
- [ ] 使用 Optional 处理 null
- [ ] 优先使用接口
- [ ] 异常处理具体
- [ ] 使用 try-with-resources
- [ ] Stream API 适当使用
- [ ] 注解使用正确

---

## 审查效率技巧 (Efficiency Tips)

### 1. 使用工具

- **自动化检查**：lint、格式化、静态分析
- **Diff 工具**：更好的 diff 可视化
- **IDE 集成**：在 IDE 中审查代码

### 2. 专注模式

- **分批审查**：不要一次审查太多文件
- **时间限制**：每次审查不超过 1 小时
- **休息**：长时间审查后休息

### 3. 优先级

- **先看大图**：从整体到细节
- **关注重要**：优先关注关键代码
- **信任作者**：小的信任作者

---

## 团队协作 (Team Collaboration)

### 建立审查文化

1. **定期培训**：分享审查经验和最佳实践
2. **轮换审查者**：不同人审查不同的 PR
3. **收集反馈**：持续改进审查流程
4. **庆祝成功**：认可好的贡献

### 处理分歧

1. **讨论升级**：无法达成一致时，升级到团队负责人
2. **技术决策**：基于技术优点，不基于个人偏好
3. **保持尊重**：即使有分歧，也要保持尊重
4. **妥协**：有时需要妥协以推进进度

---

**记住**：代码审查是提高代码质量和团队学习的重要机会。以建设性和尊重的方式进行审查，重点关注代码，不关注人。
