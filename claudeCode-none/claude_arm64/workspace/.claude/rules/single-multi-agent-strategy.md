# Single vs Multi-Agent Strategy

## 核心原则

> **默认单 Agent，多 Agent 仅用于对抗不确定性。**
>
> **Multi Agent 是战术扩展，不是默认升级。**

---

## 决策树

```
收到任务
    ↓
目标清晰？
    ├─ 是 → 攻击面/模块单一？
    │       ├─ 是 → Single Agent ✅
    │       └─ 否 → 失败成本高？
    │               ├─ 是 → 考虑 Multi-Agent
    │               └─ 否 → Single Agent ✅
    │
    └─ 否 → 有明显不确定性？
            ├─ 否 → Single Agent ✅
            └─ 是 → 评估不确定性类型
                    ├─ 认知冲突 → Multi-Agent
                    ├─ 路径分叉 → Multi-Agent
                    └─ 角色冲突 → Multi-Agent
```

---

## Single Agent 模式

**适用条件**（满足任一即可）：
- 研究目标清晰、攻击面单一
- 功能需求明确、模块单一
- 失败成本可控
- 无明显不确定性
- 预计耗时 < 2 小时

**工作方式**：
- Research Lead / Dev Lead 独立完成所有步骤
- 每步记录 Step Record
- 关键决策记录 Decision Record

**优势**：
- 上下文连贯
- 无需协调开销
- 决策快速

---

## Multi-Agent 模式

**适用条件**（满足任一即可）：
- 认知视角冲突（状态机 vs 加密层）
- 研究路径分叉（多条合理路径）
- 角色冲突（逆向 + 审计 + PoC）
- 失败成本高（需要风险对冲）
- 多模块可并行开发
- 预计耗时 > 2 小时

**工作方式**：
- Research Lead / Dev Lead 作为决策者
- Specialist Agents 作为 Evidence Provider
- 后台并行执行（`run_in_background=true`）
- 完成后合并 Evidence

---

## 安全研究 Agent 分配

| 场景 | Agent 组合 | 原因 |
|------|-----------|------|
| 固件完整审计 | reverse-analyst + code-audit + skeptic | 多视角并行 |
| 协议逆向 | reverse-analyst + poc-engineer | 分析 + 验证 |
| Web 应用审计 | code-audit + skeptic + poc-engineer | 审计 + 反证 + 验证 |
| 漏洞复现 | poc-engineer | 单一目标 |
| 未知样本分析 | reverse-analyst + skeptic | 分析 + 反证 |

**Specialist Agents**：
- `reverse-analyst` - 逆向分析（二进制 / JS / Android / iOS）
- `code-audit` - 代码审计（源码 / 逻辑漏洞 / 安全规范）
- `poc-engineer` - 安全脚本开发（PoC / Exploit / Frida / GDB / IDA / Burp）
- `skeptic` - 怀疑论者审计（反证 / 挑战假设）
- `research-recorder` - 研究记录（步骤 / 决策 / 文档）

---

## 日常开发 Agent 分配

| 场景 | Agent 组合 | 原因 |
|------|-----------|------|
| 大型功能开发 | dev-engineer x 2+ | 多模块并行 |
| 前后端协作 | dev-engineer x 2 | 前端 + 后端并行 |
| 重构 + 测试 | dev-engineer x 2 | 重构 + 测试并行 |
| Bug 修复 | dev-engineer | 单一目标 |
| 自动化脚本 | dev-engineer | 单一目标 |

**Specialist Agents**：
- `dev-engineer` - 日常开发（功能 / Bug / 重构 / 测试 / 自动化）

---

## 并发安全规则

**标注并发任务前，必须确认**：

1. **前置条件完成**：所有并发任务的前置条件必须已完成
2. **无依赖关系**：并发任务之间不能有显式或隐式依赖
3. **无资源冲突**：并发任务不能访问/修改同一资源
4. **无数据竞争**：并发任务不能产生数据竞争

**快速检查**：
- ✅ 不同模块、无数据共享 → 可并发
- ❌ 同一模块、有依赖、有数据共享 → 串行

---

## 默认原则

> **当你不确定时，使用 Single Agent。**
>
> **Multi Agent 是战术扩展，不是默认升级。**

> **遇到流程分支时，应主动（PROACTIVELY）使用多 Agent 并行分析。**
