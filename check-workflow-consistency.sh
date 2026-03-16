#!/bin/bash
# claudeSandBox 流程一致性检查脚本
# 检查 agents.md 中的流程定义是否一致

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

AGENTS_FILE="claudeCode-none/claude_arm64/workspace/.claude/rules/agents.md"
BRAINSTORMING_FILE="claudeCode-none/claude_arm64/workspace/.claude/skills/thinking/brainstorming/SKILL.md"
POC_EXPLOIT_FILE="claudeCode-none/claude_arm64/workspace/.claude/skills/security/poc-exploit/SKILL.md"
DEV_FILE="claudeCode-none/claude_arm64/workspace/.claude/agents/dev.md"

echo -e "${BLUE}🔍 检查 claudeSandBox 流程一致性...${NC}"
echo ""

ERRORS=0
WARNINGS=0

# 检查 1: 完整开发流程必须包含 tdd-guide
echo -e "${BLUE}检查 1: 完整开发流程是否包含 tdd-guide${NC}"
if grep -A 20 "### 🎨 完整开发流程" "$AGENTS_FILE" | grep -q "tdd-guide"; then
    echo -e "${GREEN}  ✅ 完整开发流程包含 tdd-guide${NC}"
else
    echo -e "${RED}  ❌ 完整开发流程缺少 tdd-guide${NC}"
    ((ERRORS++))
fi

# 检查 2: Bug 修复流程必须包含 tdd-guide
echo -e "${BLUE}检查 2: Bug 修复流程是否包含 tdd-guide${NC}"
if grep -A 20 "### 🔄 快速修复流程" "$AGENTS_FILE" | grep -q "tdd-guide"; then
    echo -e "${GREEN}  ✅ Bug 修复流程包含 tdd-guide${NC}"
else
    echo -e "${RED}  ❌ Bug 修复流程缺少 tdd-guide${NC}"
    ((ERRORS++))
fi

# 检查 3: doc-updater 位置一致性
echo -e "${BLUE}检查 3: doc-updater 位置一致性${NC}"
# 提取所有流程中的 doc-updater 位置
WORKFLOW_COUNT=$(grep -c "doc-updater" "$AGENTS_FILE" || true)
echo -e "${YELLOW}  ℹ️  发现 $WORKFLOW_COUNT 处 doc-updater 引用${NC}"

# 检查是否有 doc-updater → reviewer 的错误顺序（应该是 reviewer → doc-updater）
if grep "doc-updater.*→.*reviewer" "$AGENTS_FILE" > /dev/null 2>&1; then
    echo -e "${RED}  ❌ 发现错误顺序: doc-updater → reviewer（应该是 reviewer → doc-updater）${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}  ✅ doc-updater 顺序正确（reviewer → doc-updater）${NC}"
fi

# 检查 4: brainstorming 排除场景一致性
echo -e "${BLUE}检查 4: brainstorming 排除场景一致性${NC}"
if grep -q "PoC 编写" "$BRAINSTORMING_FILE"; then
    echo -e "${GREEN}  ✅ brainstorming 包含 PoC 编写排除场景${NC}"
else
    echo -e "${YELLOW}  ⚠️  brainstorming 缺少 PoC 编写排除场景${NC}"
    ((WARNINGS++))
fi

# 检查 5: poc-exploit 是否标注为简单任务
echo -e "${BLUE}检查 5: poc-exploit 是否标注为简单任务${NC}"
if grep -q "简单任务" "$POC_EXPLOIT_FILE"; then
    echo -e "${GREEN}  ✅ poc-exploit 标注为简单任务${NC}"
else
    echo -e "${YELLOW}  ⚠️  poc-exploit 未标注为简单任务${NC}"
    ((WARNINGS++))
fi

# 检查 6: dev agent 前置条件
echo -e "${BLUE}检查 6: dev agent 前置条件${NC}"
if grep -q "永远不能作为第一个环节" "$DEV_FILE"; then
    echo -e "${GREEN}  ✅ dev agent 明确不能作为第一个环节${NC}"
else
    echo -e "${RED}  ❌ dev agent 未明确不能作为第一个环节${NC}"
    ((ERRORS++))
fi

# 检查 7: 架构驱动流程
echo -e "${BLUE}检查 7: 架构驱动流程是否完整${NC}"
if grep -A 5 "### 3. 架构驱动流程" "$AGENTS_FILE" | grep -q "tdd-guide"; then
    echo -e "${GREEN}  ✅ 架构驱动流程包含 tdd-guide${NC}"
else
    echo -e "${RED}  ❌ 架构驱动流程缺少 tdd-guide${NC}"
    ((ERRORS++))
fi

# 检查 8: 运维集成流程是否已删除
echo -e "${BLUE}检查 8: 运维集成流程是否已删除${NC}"
if grep -q "### 4. 运维集成流程" "$AGENTS_FILE"; then
    echo -e "${YELLOW}  ⚠️  仍然存在运维集成流程（应该已删除）${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}  ✅ 运维集成流程已删除${NC}"
fi

# 检查 9: 条件自动触发是否已删除
echo -e "${BLUE}检查 9: 条件自动触发（context-management）是否已删除${NC}"
if grep -q "条件自动触发" "$AGENTS_FILE"; then
    echo -e "${YELLOW}  ⚠️  仍然存在条件自动触发部分${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}  ✅ 条件自动触发已删除${NC}"
fi

# 检查 10: 所有变体是否同步
echo -e "${BLUE}检查 10: 所有变体是否同步${NC}"
VARIANTS=(
    "claudeCode-none/claude_x64/workspace/.claude/rules/agents.md"
    "claudeCode-lsp/claude_arm64/workspace/.claude/rules/agents.md"
    "claudeCode-lsp/claude_x64/workspace/.claude/rules/agents.md"
)

SYNCED=true
for variant in "${VARIANTS[@]}"; do
    if ! cmp -s "$AGENTS_FILE" "$variant"; then
        echo -e "${RED}  ❌ $variant 与源文件不同${NC}"
        SYNCED=false
        ((ERRORS++))
    fi
done

if $SYNCED; then
    echo -e "${GREEN}  ✅ 所有变体已同步${NC}"
fi

# 总结
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}检查总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！流程一致性良好。${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WARNINGS 个警告，建议修复。${NC}"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个错误和 $WARNINGS 个警告，需要修复！${NC}"
    exit 1
fi
