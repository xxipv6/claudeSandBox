---
description: 完整安全审计（Web 白盒 + IoT）
---

# 安全审计

## 功能说明

执行完整的安全审计，自动识别审计类型并调用相应的 agent。

---

## 执行流程

### 第一步：识别审计类型

分析用户输入或项目结构，自动识别：

**Web 应用审计**（白盒）：
- 检测到 Web 框架（Express、Django、Spring 等）
- 检测到 HTTP 路由、API 接口
- 检测到前端代码

**IoT 设备审计**：
- 检测到固件文件（.bin、.elf、.fw）
- 检测到嵌入式代码（C/C++、汇编）
- 检测到硬件配置

---

### 第二步：调用 Security-Tester Agent

```bash
调用：security-tester agent

Agent 职责：
- Web 审计：使用 whitebox-audit skill（8 阶段流程）
- IoT 审计：使用 iot-audit skill（统一模型）
- 生成审计报告和修复建议
```

**Agent 调用方式**：

```markdown
请使用 security-tester agent 执行安全审计：

**审计类型**：[Web 白盒 / IoT]
**目标范围**：[文件路径或项目路径]
**审计重点**：[可选：越权、注入、状态机等]

**输出要求**：
- 漏洞清单（按风险等级排序）
- 攻击路径分析
- 修复建议
```

---

### 第三步：生成审计报告

```markdown
## 安全审计报告

### 审计概览
- 审计类型：[Web 白盒 / IoT]
- 审计范围：[路径或模块]
- 审计时间：[时间戳]

### 漏洞清单

#### 高危漏洞 (X)

**1. [漏洞类型]**
- **位置**：`file:line`
- **风险等级**：高危
- **CVSS 评分**：[评分]
- **漏洞描述**：[详细描述]
- **攻击路径**：[如何利用]
- **修复建议**：[具体方案]

#### 中危漏洞 (Y)

[同上格式]

#### 低危漏洞 (Z)

[同上格式]

### 攻击路径分析

[跨接口联动、组合攻击等]

### 修复优先级

1. **立即修复**：[高危漏洞列表]
2. **尽快修复**：[中危漏洞列表]
3. **后续改进**：[低危漏洞列表]

### 总结
- 整体安全评分：[评分]
- 主要风险：[总结]
- 建议行动：[下一步]
```

---

## 使用方式

### Web 应用审计

```bash
# 审计整个项目
/security-audit

# 审计特定模块
/security-audit src/auth/
security-audit api/

# 审计特定文件
/security-audit src/controllers/user.js
```

### IoT 设备审计

```bash
# 审计固件
/security-audit firmware.bin

# 审计源码
/security-audit src/

# 审计混合项目
/security-audit ./
```

---

## Agent Skill 映射

**security-tester agent 使用的 skills**：

| 审计类型 | Skill | 流程 |
|----------|-------|------|
| Web 白盒 | `security/whitebox-audit` | 8 阶段流程 |
| IoT | `security/iot-audit` | 统一模型 |

**Web 白盒 8 阶段**：
1. 执行模型与信任边界
2. 依赖与框架分析
3. 执行链还原
4. 路由枚举
5. 业务流程分析
6. 越权审计（主线）
7. 状态机分析
8. 攻击路径

**IoT 统一模型**：
- 入口 → 权限 → 状态 → 副作用

---

## 工作流程图

```
用户输入
    ↓
识别审计类型
    ↓
security-tester agent
    ↓
    ├─→ Web 白盒 → whitebox-audit skill
    └─→ IoT → iot-audit skill
    ↓
生成审计报告
```

---

## 输出格式

### 漏洞格式

```markdown
#### [漏洞类型] - `[file:line]`

**风险等级**：🔴 高危 / 🟡 中危 / 🟢 低危

**漏洞描述**：
[详细说明]

**攻击路径**：
1. 攻击者 [步骤 1]
2. 然后 [步骤 2]
3. 最终 [后果]

**修复建议**：
```diff
- vulnerable code
+ fixed code
```

**参考**：
- CWE-XXX
- [相关文档]
```

---

## 注意事项

1. **自动识别**：命令自动识别审计类型，无需手动指定
2. **Agent 职责**：security-tester agent 负责实际审计工作
3. **Skill 使用**：agent 根据审计类型加载相应的 skill
4. **重点突出**：越权作为 Web 审计的主线
