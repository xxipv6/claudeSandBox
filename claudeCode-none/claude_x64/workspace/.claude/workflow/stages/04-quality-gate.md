# Stage 04: Quality Gate

## 目标

质量验证

## 职责

- 静态分析
- 安全扫描
- 代码规范检查
- 自动测试
- 结果验证

## 前置条件

- Stage 03 (mode-execution) 完成
- 有代码或分析结果

## 执行步骤（强制）

### 步骤 1：质量门禁（自动检查）（强制）

#### 步骤 1-1：静态分析（强制）

**执行命令**（根据项目类型）：
```bash
# JavaScript/TypeScript
cd /workspace && npm run lint
cd /workspace && npx eslint .

# Python
cd /workspace && pylint .
cd /workspace && flake8 .

# Go
cd /workspace && go vet ./...
cd /workspace && golint ./...
```

**检查内容**：
- 语法错误
- 代码风格
- 潜在 bug

**检查点**：
- [ ] 已执行静态分析
- [ ] 已记录分析结果

#### 步骤 1-2：安全扫描（强制）（如果适用）

**执行命令**（根据项目类型）：
```bash
# JavaScript/TypeScript
cd /workspace && npm audit

# Python
cd /workspace && bandit -r .

# 通用
cd /workspace && trivy fs .
```

**检查内容**：
- 已知漏洞
- 不安全的依赖
- 安全最佳实践

**检查点**：
- [ ] 已执行安全扫描
- [ ] 已记录扫描结果

#### 步骤 1-3：代码规范检查（强制）

**执行命令**（根据项目配置）：
```bash
# 检查代码格式
cd /workspace && npm run format:check
cd /workspace && black --check .
```

**检查内容**：
- 代码格式
- 命名规范
- 文档完整性

**检查点**：
- [ ] 已执行规范检查
- [ ] 已记录检查结果

### 步骤 2：质量检查结果评估（强制）

**评估标准**：
- 所有检查通过 → 继续
- 有警告但不影响功能 → 继续
- 有错误 → 触发修复流程

**检查点**：
- [ ] 已评估检查结果
- [ ] 已决定是否触发修复

### 步骤 3：修复流程（仅不通过时）（强制）

**循环逻辑**（最多 3 次）：
1. 启动 coder agent 修复问题
2. Git commit（修复）
3. 重新执行质量检查
4. 评估结果

**修复步骤**：

**步骤 1**：读取 coder agent 定义
**现在读取**：`.claude/agents/dev-coder.md` 或 `.claude/agents/script-coder.md`

**步骤 2**：启动 coder agent 修复
- 传入错误信息
- 要求修复

**步骤 3**：Git commit
```bash
cd /workspace && git add .
cd /workspace && git commit -m "Fix: Quality gate issues"
```

**步骤 4**：重新执行质量检查
- 返回步骤 1

**检查点**：
- [ ] 已执行修复流程（如需要）
- [ ] 已重新执行质量检查

### 步骤 4：验证流程（自动测试）（强制）

#### 步骤 4-1：运行测试（强制）（如果有）

**执行命令**：
```bash
cd /workspace && npm test
cd /workspace && pytest
cd /workspace && go test ./...
```

**检查点**：
- [ ] 已运行测试
- [ ] 已记录测试结果

#### 步骤 4-2：验证代码功能（强制）

**验证逻辑**：
- 检查是否满足需求
- 检查关键功能是否正常
- 检查边界情况

**检查点**：
- [ ] 已验证代码功能
- [ ] 已记录验证结果

### 步骤 5：验证结果评估（强制）

**评估标准**：
- 所有测试通过 → 继续
- 功能验证通过 → 继续
- 测试失败或验证失败 → 触发回滚流程

**检查点**：
- [ ] 已评估验证结果
- [ ] 已决定是否触发回滚

### 步骤 6：Git commit（强制）（最终）

**执行命令**：
```bash
cd /workspace && git add .
cd /workspace && git commit -m "Complete: Task {id} - ready to merge"
```

**检查点**：
- [ ] 已提交最终代码
- [ ] Git commit 成功

### 步骤 7：更新任务状态（强制）

**更新文件**：`.claude/task_states/task-{id}.json`

**更新内容**：
```json
{
  "status": "running",
  "current_stage": "04-quality-gate",
  "current_step": "quality_gate_completed",
  "progress": 80,
  "quality_check": {
    "static_analysis": "passed",
    "security_scan": "passed",
    "code_style": "passed",
    "tests": "passed"
  }
}
```

**检查点**：
- [ ] 已更新任务状态
- [ ] 已记录质量检查结果

## 输出

- **quality_check_result**（质量检查结果）
- **test_result**（测试结果）
- **git_commit**（最终 commit）
- **quality_report**（质量报告）

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| 质量检查不通过（3次） | Git 回滚，任务状态改为 failed |
| 测试失败 | Git 回滚，分析失败原因 |
| Git commit 失败 | 任务状态改为 failed |
| 没有测试 | 跳过测试步骤（警告） |

## 回滚流程

**触发条件**：
- 质量检查 3 次不通过
- 测试失败
- 验证失败

**回滚步骤**：

**步骤 1**：Git 回滚
```bash
cd /workspace && git reset --hard {start_commit}
```

**步骤 2**：分析失败原因
- 记录错误信息
- 写入 `.claude/execution_logs/{id}.log`

**步骤 3**：任务状态改为 failed
- 更新 `.claude/task_states/task-{id}.json`
- 记录失败原因

**检查点**：
- [ ] 已执行 Git 回滚
- [ ] 已分析失败原因
- [ ] 已更新任务状态

## 授权说明

此阶段需要代码检查和测试的授权（已包含在主授权中）。

## 超时设置

- 默认超时：180 秒
- 单次检查：60 秒

## 下一阶段

完成后进入 **Stage 05: Completion**

## 特殊情况

### 情况 1：项目没有测试

**检测到没有测试**：
- 跳过测试步骤
- 记录警告
- 继续执行

### 情况 2：质量检查工具不存在

**检测到工具不存在**：
- 尝试安装工具
- 安装失败 → 跳过该检查
- 记录警告

### 情况 3：修复循环 3 次仍不通过

**检测到 3 次修复仍不通过**：
- 停止修复
- 触发回滚流程
- 任务状态改为 failed
