---
description: 安全工具开发工作流。当需要开发安全工具（调试器、反汇编器、Fuzzer、扫描器、分析工具等）时，应主动（PROACTIVELY）使用此 skill。核心流程：需求分析 → 架构设计 → 引擎实现 → 插件系统 → 测试验证。
---

# SecDev Workflow（安全工具开发工作流）

## 适用场景

- 安全工具开发（调试器 / 反汇编器 / Fuzzer / 扫描器 / 分析工具）
- 安全工具核心功能扩展
- 插件系统开发
- 工具 CLI / GUI 界面开发

---

## 核心流程

```
需求分析 → 架构设计（research-planner）→ 引擎实现 → 插件系统 → 测试验证
```

### 新工具开发流程

```
用户请求（如"开发一个调试器"）
    ↓
brainstorming（设计探索）（如需要）
    ↓
research-planner（架构规划）
    → 核心引擎设计
    → 模块划分
    → 插件接口定义
    → 开发步骤
    ↓
secdev-engineer（执行开发）
    → 实现核心引擎
    → 实现插件系统
    → 实现 CLI
    → 测试验证
```

### 功能扩展流程

```
用户请求（如"给这个 Fuzzer 加覆盖率反馈"）
    ↓
research-planner（评估影响）
    → 确认模块边界
    → 评估对现有插件的影响
    ↓
secdev-engineer（执行开发）
    → 实现新功能
    → 更新插件 API（如需要）
    → 测试验证
```

---

## 开发完成后检查清单

每完成一个功能模块，**必须**按以下顺序执行：

### 1. 代码自检
- [ ] 代码符合项目编码规范
- [ ] 无硬编码密钥 / 敏感信息
- [ ] 错误处理完善（尤其是内存操作、文件 IO、网络通信）
- [ ] 跨平台兼容（路径分隔符、编码）
- [ ] 无安全隐患（命令注入、缓冲区溢出等）

### 2. 测试
- [ ] 核心引擎单元测试
- [ ] 插件系统加载测试（如适用）
- [ ] CLI 参数解析测试
- [ ] 边界测试（大文件、空输入、畸形数据）

### 3. 插件 API 文档（如涉及插件接口）

**如果新增或修改了插件 API，必须生成插件 API 文档。**

```markdown
# Plugin API: [模块名称]

## 接口定义

### 钩子类型
| Hook Point | 触发时机 | 参数 | 返回值 |
|-----------|---------|------|--------|
| on_load | 插件加载时 | ctx: Context | None |
| on_data | 数据流入时 | data: bytes | bytes |

### 上下文对象
\`\`\`python
class Context:
    config: dict       # 配置信息
    logger: Logger     # 日志记录器
    state: dict        # 共享状态
\`\`\`

### 示例插件
\`\`\`python
from engine import Plugin, hook

class MyPlugin(Plugin):
    @hook("on_data")
    def process(self, ctx, data):
        ctx.logger.info(f"Received {len(data)} bytes")
        return data.upper()
\`\`\`
```

### 4. README 更新

```markdown
## [Tool Name]

### 功能
- [核心功能 1]
- [核心功能 2]

### 安装
\`\`\`bash
make install
\`\`\`

### 使用
\`\`\`bash
tool-name --target <input> [options]
\`\`\`

### 插件
\`\`\`bash
tool-name --list-plugins
tool-name --plugin my_plugin --target <input>
\`\`\`
```

### 5. Git 提交

使用 Conventional Commits：
```
feat(engine): add x86 disassembly module
fix(plugin): fix loader crash on invalid plugin
refactor(core): extract instruction decoder
test(fuzzer): add corpus management tests
docs(api): update plugin hook reference
```

---

## 文件输出结构

```
xxx-tool/
├── src/
│   ├── core/           ← 核心引擎
│   │   ├── engine.py   ← 引擎主体
│   │   └── config.py   ← 配置管理
│   ├── plugins/        ← 插件系统
│   │   ├── loader.py   ← 插件加载器
│   │   └── base.py     ← 插件基类
│   ├── ui/             ← CLI / TUI
│   │   └── cli.py
│   └── utils/          ← 工具函数
├── tests/
│   ├── test_engine.py
│   └── test_plugins.py
├── docs/
│   ├── plans/          ← 开发计划
│   ├── architecture/   ← 架构文档 / 插件 API
│   └── examples/       ← 使用示例
├── examples/           ← 示例插件
├── configs/            ← 默认配置
├── README.md
└── .git/
```

---

## 何时触发

### 必须触发
- **新工具开发**：从零开始的安全工具
- **核心引擎修改**：影响整体架构的变更
- **插件 API 变更**：新增 / 修改 / 删除插件接口

### 建议触发
- **新增插件**：独立功能模块
- **CLI 改进**：参数 / 输出格式变更

### 不触发
- 单个 Bug 修复
- 配置文件修改
- 文档修改

---

## 执行纪律

1. **架构先行**：先有 research-planner 的计划，再动手写
2. **核心优先**：引擎能跑 > 插件好看 > UI 好看
3. **插件接口稳定**：API 定了不轻易改
4. **必须测试**：核心模块没有测试 = 没完成
5. **Git 纪律**：每个功能点独立 commit，消息用 Conventional Commits
