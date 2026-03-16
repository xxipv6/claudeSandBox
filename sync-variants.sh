#!/bin/bash
# claudeSandBox 自动同步脚本
# 将 claudeCode-none/claude_arm64 的变更同步到其他 3 个变体

set -e  # 遇到错误立即退出

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 开始同步 claudeSandBox 变体...${NC}"

# 源目录（基准变体）
SOURCE="claudeCode-none/claude_arm64/workspace/.claude"

# 目标变体
VARIANTS=(
    "claudeCode-none/claude_x64/workspace/.claude"
    "claudeCode-lsp/claude_arm64/workspace/.claude"
    "claudeCode-lsp/claude_x64/workspace/.claude"
)

# 同步到每个变体
for variant in "${VARIANTS[@]}"; do
    echo -e "${GREEN}  ✓ 同步到 $variant${NC}"
    rsync -av --delete "$SOURCE/" "$variant/"
done

echo -e "${BLUE}✅ 同步完成！${NC}"
echo ""
echo "已同步以下内容："
echo "  - agents/     (智能体定义)"
echo "  - commands/   (快捷命令)"
echo "  - skills/     (技能库)"
echo "  - hooks/      (钩子)"
echo "  - rules/      (强制规则)"
