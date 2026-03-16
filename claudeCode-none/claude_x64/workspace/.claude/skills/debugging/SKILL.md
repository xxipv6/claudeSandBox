---
name: debugging
description: 系统化调试方法论、工具使用、问题定位和解决技巧。
origin: claudeSandBox
---

# 调试技能 (Debugging Skills)

## 何时激活 (When to Activate)

- 代码行为不符合预期时
- 出现错误或异常需要诊断时
- 性能问题需要分析时
- 需要理解代码执行流程时
- 需要定位 bug 根本原因时

---

## 调试方法论 (Debugging Methodology)

### 1. 科学调试法 (Scientific Debugging)

```
观察 → 假设 → 实验 → 验证 → 迭代
```

#### 步骤

**1. 观察问题 (Observe)**
- 精确定义问题行为
- 收集错误信息、日志、堆栈跟踪
- 确定问题的边界条件

**2. 形成假设 (Hypothesize)**
- 基于观察提出可能的根本原因
- 列出所有可能的原因
- 按概率排序

**3. 设计实验 (Experiment)**
- 创建测试用例验证假设
- 使用调试工具收集证据
- 一次只改变一个变量

**4. 验证结果 (Verify)**
- 实验结果支持或否定假设
- 如果否定，返回步骤 2
- 如果支持，确认解决方案

**5. 修复并验证 (Fix & Verify)**
- 实施修复
- 添加回归测试
- 确认问题解决且无副作用

### 2. 二分调试法 (Binary Search Debugging)

适用于：定位复杂问题或不确定的问题范围。

```python
def binary_search_debug(suspect_code, input):
    """
    使用二分法定位问题代码。
    """
    # 1. 将代码分成两半
    # 2. 测试上半部分
    if test_first_half(suspect_code, input):
        # 问题在上半部分，继续细分
        return binary_search_debug(first_half, input)
    else:
        # 问题在下半部分，继续细分
        return binary_search_debug(second_half, input)
```

### 3. 橡皮鸭调试法 (Rubber Duck Debugging)

适用于：需要理清思路的问题。

```
1. 向"橡皮鸭"（或同事）逐行解释代码
2. 在解释过程中，很多问题会自现
3. 专注于"我期望什么"vs"实际发生了什么"
```

---

## 调试工具 (Debugging Tools)

### Python

#### pdb 内置调试器
```python
import pdb

# 方式 1：在代码中设置断点
def problematic_function(x):
    pdb.set_trace()  # 断点
    result = complex_calculation(x)
    return result

# 方式 2：从命令行启动
# python -m pdb script.py

# 常用 pdb 命令：
# l (list) - 显示代码
# n (next) - 下一行
# s (step) - 进入函数
# c (continue) - 继续执行
# p variable (print) - 打印变量
# pp variable - 美化打印
# w (where) - 显示堆栈
# b 10 (break) - 在第 10 行设置断点
# q (quit) - 退出
```

#### ipdb 增强调试器
```bash
pip install ipdb

# 使用方式相同，但支持：
- Tab 自动补全
- 语法高亮
- 更好的代码显示
```

#### logging 模块
```python
import logging

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def process_data(data):
    logger.debug(f"Processing data: {data}")
    logger.info(f"Data length: {len(data)}")

    try:
        result = complex_operation(data)
        logger.info("Operation successful")
        return result
    except Exception as e:
        logger.error(f"Operation failed: {e}", exc_info=True)
        raise
```

#### pprint 美化输出
```python
from pprint import pprint

# 查看复杂数据结构
data = {
    'users': [{'name': 'Alice', 'age': 30}, {'name': 'Bob', 'age': 25}],
    'metadata': {'count': 2, 'source': 'api'}
}

pprint(data, indent=2, width=80)
```

### JavaScript/TypeScript

#### Chrome DevTools
```javascript
// 1. 在代码中设置断点
debugger;  // 强制断点

// 2. Console API
console.log('Simple log');
console.error('Error message');
console.warn('Warning message');
console.table(data);  // 表格形式显示
console.group('Group label');
console.log('Inside group');
console.groupEnd();

// 3. 条件断点
// 在 DevTools 中：右键 → Add conditional breakpoint
// 输入条件：x > 100

// 4. 监视表达式
// DevTools → Watch → 添加表达式
```

#### Node.js 调试器
```bash
# 启动调试模式
node --inspect script.js

# 或使用 inspect-brk 在第一行暂停
node --inspect-brk script.js

# 然后在 Chrome 中访问：
# chrome://inspect
```

### Go

#### Delve 调试器
```bash
# 安装
go install github.com/go-delve/delve/cmd/dlv@latest

# 调试程序
dlv debug ./cmd/myapp

# 常用命令：
# (dlv) break main.go:25  - 设置断点
# (dlv) breakpoints     - 列出断点
# (dlv) next            - 下一行
# (dlv) step            - 进入函数
# (dlv) continue        - 继续执行
# (dlv) print variable  - 打印变量
# (dlv) goroutines      - 列出 goroutines
# (dlv) goroutine 5     - 切换到 goroutine 5
# (dlv) stack           - 显示堆栈
```

#### fmt 调试
```go
import "fmt"

func process(data []string) {
    fmt.Printf("Data: %+v\n", data)
    fmt.Printf("Length: %d\n", len(data))
}
```

### Java

#### JDB 命令行调试器
```bash
# 编译时包含调试信息
javac -g MyClass.java

# 启动调试
jdb MyClass

# 常用命令：
# stop at MyClass:25     - 设置断点
# run                    - 运行程序
# next                   - 下一行
# step                   - 进入方法
# cont                   - 继续执行
# print variable         - 打印变量
# locals                 - 显示所有局部变量
# where                  - 显示堆栈
```

#### IDE 调试器（IntelliJ/Eclipse）
```java
// 1. 在代码左侧点击设置断点
// 2. 右键 → Debug 运行
// 3. 使用以下快捷键：
// F8 - Step Over
// F7 - Step Into
// F9 - Resume
// Ctrl+F8 - Toggle Breakpoint

// 条件断点：
// 右键断点 → Edit Breakpoint → Condition
// 输入：x > 100

// 日志断点（不暂停，只打印）：
// 右键断点 → More → Log message
// 输入：User {user.id} logged in
```

---

## 常见问题模式 (Common Problem Patterns)

### 1. 空值/未定义问题

#### Python
```python
# ❌ 问题：未检查 None
user = get_user(id)
print(user.name)  # AttributeError: 'NoneType'

# ✅ 解决：显式检查
user = get_user(id)
if user is None:
    raise ValueError(f"User {id} not found")
print(user.name)

# ✅ 或使用断言
assert user is not None, f"User {id} not found"
```

#### JavaScript
```javascript
// ❌ 问题：未检查 undefined/null
const user = getUser(id);
console.log(user.name);  // TypeError: Cannot read property 'name'

// ✅ 解决：可选链和空值合并
const user = getUser(id);
console.log(user?.name ?? 'Unknown');

// ✅ 或显式检查
if (!user) {
    throw new Error(`User ${id} not found`);
}
console.log(user.name);
```

### 2. 异步问题

#### Python async/await
```python
# ❌ 问题：忘记 await
async def fetch_data():
    result = api_call()  # 返回 Coroutine，不执行
    return result

# ✅ 解决：添加 await
async def fetch_data():
    result = await api_call()
    return result
```

#### JavaScript Promise
```javascript
// ❌ 问题：忘记 await
async function fetchData() {
    const result = apiCall();  // 返回 Promise，不等待
    return result;
}

// ✅ 解决：添加 await
async function fetchData() {
    const result = await apiCall();
    return result;
}

// ❌ 问题：Promise 链中的错误未捕获
fetchData()
    .then(data => processData(data))
    .then(result => save(result))
    // 没有 catch，错误被吞掉

// ✅ 解决：添加 catch
fetchData()
    .then(data => processData(data))
    .then(result => save(result))
    .catch(error => console.error('Error:', error));

// ✅ 或使用 async/await + try/catch
try {
    const data = await fetchData();
    const result = await processData(data);
    await save(result);
} catch (error) {
    console.error('Error:', error);
}
```

### 3. 竞态条件

#### Python
```python
# ❌ 问题：检查后使用（TOCTOU）
if os.path.exists(filename):
    # 另一个进程可能在这里删除文件
    with open(filename) as f:
        data = f.read()

# ✅ 解决：直接尝试，捕获异常
try:
    with open(filename) as f:
        data = f.read()
except FileNotFoundError:
    handle_missing_file()
```

#### JavaScript
```javascript
// ❌ 问题：异步竞态
let data;
fetchData().then(result => { data = result; });
console.log(data);  // undefined，fetch 未完成

// ✅ 解决：等待完成
const data = await fetchData();
console.log(data);
```

### 4. 内存泄漏

#### JavaScript
```javascript
// ❌ 问题：未清理的事件监听器
component.addEventListener('click', handler);
// 组件销毁时未移除监听器

// ✅ 解决：添加和移除成对出现
component.addEventListener('click', handler);
// 组件销毁时
component.removeEventListener('click', handler);
```

#### Python
```python
# ❌ 问题：循环引用
class Node:
    def __init__(self):
        self.children = []
        self.parent = None

# 创建循环引用
parent = Node()
child = Node()
parent.children.append(child)
child.parent = parent  # 循环引用

# ✅ 解决：使用弱引用
import weakref

class Node:
    def __init__(self):
        self.children = []
        self.parent = None

child = Node()
parent = Node()
parent.children.append(child)
child.parent = weakref.ref(parent)  # 弱引用
```

### 5. 类型错误

#### TypeScript
```typescript
// ❌ 问题：使用 any
function processData(data: any) {
    return data.map((item: any) => item.value * 2);
}

// ✅ 解决：明确定义类型
interface DataItem {
    value: number;
}

function processData(data: DataItem[]): number[] {
    return data.map(item => item.value * 2);
}
```

#### Python Type Hints
```python
# ❌ 问题：无类型提示
def process(users):
    return [u['name'] for u in users]

# ✅ 解决：添加类型提示
from typing import List, Dict

def process(users: List[Dict[str, str]]) -> List[str]:
    return [u['name'] for u in users]
```

---

## 性能调试 (Performance Debugging)

### 1. 性能分析工具

#### Python cProfile
```python
import cProfile
import pstats

def profile_function():
    pr = cProfile.Profile()
    pr.enable()

    # 你的代码
    result = slow_function()

    pr.disable()

    # 打印统计
    stats = pstats.Stats(pr)
    stats.sort_stats('cumulative')
    stats.print_stats(10)  # 前 10 个最慢的函数
```

#### JavaScript Performance API
```javascript
// 测量代码执行时间
console.time('processing');
// 你的代码
processData();
console.timeEnd('processing');

// 使用 performance.mark()
performance.mark('start');
processData();
performance.mark('end');
performance.measure('processing', 'start', 'end');

const measure = performance.getEntriesByName('processing')[0];
console.log(`Duration: ${measure.duration}ms`);
```

#### Go pprof
```bash
# 添加 pprof 支持
import _ "net/http/pprof"

# 运行程序后访问：
# http://localhost:6060/debug/pprof/

# CPU 性能分析
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# 内存分析
go tool pprof http://localhost:6060/debug/pprof/heap
```

### 2. 性能优化检查清单

- [ ] 使用算法分析工具识别热点
- [ ] 检查是否有不必要的重复计算
- [ ] 查找循环中的数据库查询（N+1 问题）
- [ ] 检查是否有不必要的序列化/反序列化
- [ ] 使用缓存（memoization）优化重复调用
- [ ] 检查是否有内存泄漏
- [ ] 优化数据库查询（添加索引、优化 JOIN）

---

## 调试最佳实践 (Debugging Best Practices)

### ✅ DO（应该做）

1. **使用版本控制**
   - 修改前创建分支
   - 保留可工作的版本
   - 小步提交，便于回退

2. **隔离问题**
   - 创建最小可复现用例
   - 移除不相关的代码
   - 使用单元测试隔离

3. **保留调试代码**
   - 使用条件编译
   - 添加调试日志级别
   - 不要在生产环境使用

4. **记录你的发现**
   - 记录尝试过的假设
   - 记录测试结果
   - 记录最终解决方案

### ❌ DON'T（不应该做）

1. **盲目修改代码**
   - 在不理解问题的情况下修改
   - "试试这个"式的调试
   - 一次改变多个变量

2. **忽略错误信息**
   - 不要静默捕获异常
   - 不要忽略警告
   - 不要"希望问题自己消失"

3. **过度依赖调试器**
   - 有时候日志更高效
   - 打印语句有时更简单
   - 选择合适的工具

4. **在生产环境调试**
   - 在开发环境充分测试
   - 使用测试环境模拟
   - 避免直接在生产环境修改

---

## 调试清单 (Debugging Checklist)

### 遇到问题时

- [ ] 我能重现这个问题吗？
- [ ] 问题的精确症状是什么？
- [ ] 什么时候发生？（频率、时机）
- [ ] 最近有什么变化？
- [ ] 我收集了足够的错误信息吗？

### 开始调试前

- [ ] 我有测试用例吗？
- [ ] 我创建了最小可复现示例吗？
- [ ] 我检查了日志吗？
- [ ] 我搜索了类似问题吗？

### 调试过程中

- [ ] 我有一个具体的假设吗？
- [ ] 我设计的实验能验证假设吗？
- [ ] 我记录了每个实验的结果吗？
- [ ] 我一次只改变一个变量吗？

### 解决后

- [ ] 我找到根本原因了吗？
- [ ] 我添加了回归测试吗？
- [ ] 我记录了问题和解决方案吗？
- [ ] 我检查了是否有类似问题吗？

---

**记住**：良好的调试习惯比强大的调试工具更重要。理解代码、保持耐心、系统化方法是成功调试的关键。
