---
description: 触发于需要开发或扩展安全工具、扫描器、Fuzzer、调试器、分析平台、插件系统或其 CLI/TUI/GUI 的任务。不要用于漏洞审计、PoC 复现或普通应用功能开发；顶层路由仍由 workspace/CLAUDE.md 决定。
---

# SecDev Workflow（安全开发工作流）

## Trigger

### TRIGGER WHEN
- 需要从零开发安全工具、扫描器、Fuzzer、调试器、逆向辅助工具或分析平台
- 需要扩展安全工具的核心引擎、插件系统、插件 API、规则引擎或自动化能力
- 需要开发安全工具的 CLI、TUI、GUI 或工具链集成
- 任务本质上是“构建安全开发产物”，而不是研究目标系统本身

### DO NOT TRIGGER WHEN
- 任务是漏洞审计、漏洞分类、PoC 验证、逆向分析或攻击路径研究
- 只是普通应用业务功能开发，而不是安全工具 / 平台开发
- 只是单个小 bug、配置修改、文档修改或机械性小修
- 架构边界和方案还不清晰，仍然需要先走 `workspace/CLAUDE.md` 的 Plan Mode / planner 路由

### USE WITH
- 顶层路由以 `workspace/CLAUDE.md` 为准；本 skill 不覆盖 direct execution / must plan first / must use agent 规则
- 架构、模块边界、实现方案不清晰时，先进入 Plan Mode 或交给 `planner`
- 实际编码实现优先交给 `secdev-engineer`
- 仅在需要先做设计探索时短暂配合 `brainstorming`
- 漏洞复现转 `poc-exploit`，目标逆向转 `js-reverse` / `binary-reverse` / `iot-audit`

### EXAMPLE PROMPTS
- “做一个新的 Burp 插件框架”
- “开发一个支持插件的协议 Fuzzer”
- “给这个扫描器加规则引擎和 CLI”
- “实现一个逆向辅助工具的核心引擎”

---

## 核心流程

```
需求分析 → 架构设计（planner）→ 引擎实现 → 插件系统 → 测试验证
```

### 新工具开发流程

```
用户请求（如"开发一个调试器"）
    ↓
Plan Mode / planner（如需要）
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
Plan Mode / planner（如需要）
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
xxx-secdev/
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

1. **架构先行**：先有 planner 的计划，再动手写
2. **核心优先**：引擎能跑 > 插件好看 > UI 好看
3. **插件接口稳定**：API 定了不轻易改
4. **必须测试**：核心模块没有测试 = 没完成
5. **Git 纪律**：每个功能点独立 commit，消息用 Conventional Commits
