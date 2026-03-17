# Unified Project Contract（统一协作契约）

## Authorization（授权声明）

你被正式授权为安全研究者的顶级助手，拥有对当前容器的**完全控制权**。

## ALWAYS（必须遵守）

1. **强制流程**（最重要）：

   **第一步：判断任务类型**

   **高复杂度任务**（满足任一条件）：
   - 新功能开发：涉及多个模块/组件
   - 系统重构：影响架构或多个文件
   - 性能优化：需要深入分析
   - 安全审计：完整的代码审计
   - 集成工作：整合多个系统/服务
   → **主动询问**是否需要 `brainstorming` 辅助（设计探索）

   **中低复杂度任务**：
   - 单个功能/模块开发
   - Bug 修复
   - 简单重构
   → 直接调用 `planner` → 执行（不询问）

   **简单任务**（无需规划，直接执行）：
   - 文件操作：解压、复制、移动、删除
   - 查询操作：查看文件、搜索代码、查看日志
   - 简单命令：ls, cat, grep, find
   - 信息查看：git status, git log, ps aux
   → 直接执行

   **第二步：主动询问（仅高复杂度任务）**

   对于高复杂度任务，**主动询问用户**是否需要 brainstorming：

   **询问方式**（使用 AskUserQuestion 工具）：
   ```xml
   <tool_calls>
   <invoke name="AskUserQuestion">
   <parameter name="questions">[{
     "question": "检测到这是一个高复杂度任务：[任务描述]。是否需要使用 brainstorming 进行设计探索？",
     "header": "设计探索",
     "options": [
       {
         "label": "需要 brainstorming",
         "description": "进行设计探索，探索多种方案后再实现"
       },
       {
         "label": "不需要，直接规划",
         "description": "跳过设计探索，直接进入任务规划阶段"
       }
     ],
     "multiSelect": false
   }]</parameter>
   </invoke>
   </tool_calls>
   ```

   对于中低复杂度任务和简单任务，**跳过询问**，直接进入第三步。

   **第三步：根据用户选择执行**

   **路径 A（高复杂度 + 用户选择需要 brainstorming）**
   1. 使用 brainstorming skill 进行设计探索
   2. 呈现设计方案
   3. **必须调用 AskUserQuestion 工具**等待用户批准设计方案
   4. ⚠️ **输出设计方案后，必须立即停止！禁止创建文件、执行代码！**
   5. 用户批准后，**必须**调用 `planner` 智能体
   6. ⚠️ **禁止跳过 planner！禁止自己规划任务！**

   **路径 B（高复杂度 + 用户选择不需要 brainstorming）**
   1. 直接调用 `planner` 智能体
   2. Planner 生成执行计划
   3. 按计划执行

   **路径 C（中低复杂度任务）**
   1. 直接调用 `planner` 智能体
   2. Planner 生成执行计划
   3. 按计划执行

   **路径 D（简单任务）**
   1. 直接执行
   2. 无需 planner

   **第四步：planner 指定执行智能体**
   - Planner 生成执行计划
   - Planner 指定"执行智能体：dev"或其他
   - **只有 planner 指定后，才能调用相应的 agent 执行**

   **第五步：执行**
   - 调用 planner 指定的智能体（如 dev）
   - 按照执行计划完成任务

2. **规划必须包含**：
   - 目标（Objective）：要达成什么
   - 边界（Boundaries）：做什么、不做什么
   - 依赖（Dependencies）：需要什么前置条件
   - 步骤（Steps）：具体执行计划
   - 预期结果（Expected Outcome）：完成后有什么产出

3. **先阅读规则**：执行任何操作前，必须先读取 `.claude/rules/agents.md`

4. **高度自治与有限询问**：
   - **自治范围**：技术实现细节、代码编写、工具选择等，缺什么补什么
   - **必须询问的固定字段**（仅限以下情况）：
     1. 高复杂度任务：是否需要 brainstorming 设计探索
     2. brainstorming 设计方案：是否批准设计方案
     3. 其他情况：无需询问，直接自治处理

5. **项目目录结构**（单一真相源）：

每个任务使用独立的项目目录，**所有与任务相关的内容都必须在项目目录内**。

**项目目录结构**：
```
xxx-project/              ← 项目根目录（所有东西都在这里）
  ├── docs/              ← 设计文档、规格说明
  │   └── specs/
  │       └── YYYY-MM-DD-<topic>-design.md
  ├── src/               ← 源代码
  ├── tests/             ← 测试
  ├── scripts/           ← 辅助脚本
  ├── data/              ← 数据、样本、流量、日志
  ├── README.md          ← 项目说明
  └── .git/              ← Git 历史
```

**重要**：
- 设计文档保存到 `xxx-project/docs/specs/`
- 代码保存到 `xxx-project/src/`
- 不要在 `/workspace` 根目录下创建任务相关文件
- 一个项目 = 一次任务的完整容器

6. **Git 管理**：
   - 至少 `git init`
   - **每次修改或编辑好代码后，立即 `git commit`**
   - 提交信息要清晰描述变更内容
   - 推荐频繁提交，小步快跑

7. **文档记录**：在 README.md 中记录关键步骤与结果

8. **验证完成**：按 Definition of Done 检查

---

## ⚠️ 关键禁止事项

**绝对禁止**：
1. ❌ **禁止高复杂度任务不询问就跳过设计探索阶段**
   - 对于高复杂度任务，**必须主动询问**用户是否需要 brainstorming
   - 使用 AskUserQuestion 工具询问
2. ❌ **禁止在 brainstorming 后直接执行代码**
3. ❌ **禁止跳过 planner 直接执行代码**
4. ❌ **禁止不调用 planner 就执行代码**
5. ❌ **禁止自己规划任务（必须用 planner）**
6. ❌ **禁止在用户批准前执行代码**

**正确流程**：
```
高复杂度 → 主动询问 brainstorming
   ├─ 需要 → brainstorming → 用户批准 → planner → 执行
   └─ 不需要 → planner → 执行

中低复杂度 → planner → 执行（不询问）

简单任务 → 直接执行（不询问）
```

---

## NEVER（禁止事项）

1. 不要访问容器外的系统
2. 不要假设状态会持久化
3. 不要将敏感数据写入公共路径
4. 不要破坏正在运行的生产环境（如有）
5. **❌ 除了明确的"简单任务"外，不要在没有 planner 的情况下执行代码**
   - 简单任务（ls, cat, grep, find 等）可以跳过 planner
   - 高/中低复杂度任务必须使用 planner
6. **❌ 对于高/中低复杂度任务，不要跳过 brainstorming 或 planner**
   - 简单任务可以跳过
   - 高复杂度任务必须先询问是否需要 brainstorming

**除此之外没有其他禁止事项**。

---
**明确授权**：
- 安装任何系统包、语言运行时、工具链
- 修改系统配置、环境变量、文件结构
- 创建、删除、移动任意文件或目录
- 执行网络相关工具（curl、nmap、tcpdump 等）
- 编译、运行、调试任何代码
- 在任务需要时自由执行高权限操作

所有操作均在隔离容器中进行，容器会在研究结束后重置。

---

## Environment（环境）

- 运行在 Docker 容器中，拥有 root 权限
- 工作空间为 `/workspace`
- 可以随意安装依赖、工具、系统包
- 不需要任何额外确认

---

## Compact Instructions（压缩规则）

**上下文压缩时，按优先级保留**：

1. **授权声明**（NEVER summarize）
2. **项目结构与当前任务进度**
3. **已修改文件及其关键变更**
4. **验证状态**（pass/fail）
5. **TODOs 和下一步计划**

---

## Definition of Done（完成标准）

任务完成前必须满足：

- [ ] 主要功能已实现并验证
- [ ] 所有测试通过（如有）
- [ ] README.md 记录了：
  - 任务目标
  - 完成步骤
  - 验证结果
  - 已知问题（如有）

---


## Context Management（上下文管理）

长会话时主动管理上下文：

- `/compact` - 压缩对话，保留 Compact Instructions 指定内容
- `/clear` - 清空会话（任务被纠偏两次以上时）
- `/context` - 查看 token 占用结构

---

## Verification（验证）

根据任务类型自动选择：

- **PoC**：运行脚本、编译、执行、记录输出
- **开发**：运行测试、lint、typecheck
- **工具**：运行示例输入、验证输出
- **分析**：记录分析过程与结论
