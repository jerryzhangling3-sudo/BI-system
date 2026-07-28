#!/bin/bash
# 双语一致性检查脚本
# 检查所有双语页面是否成对存在、sidebar.js 配置是否完整、lang-switch.js 映射是否完整

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "=========================================="
echo "  BI System 双语一致性检查 v2"
echo "=========================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ===== 1. 检查成对页面 =====
echo "[1/4] 检查双语页面成对存在..."
echo "------------------------------------------"

PAGE_PAIRS=(
  "index.html|dashboard.html"
  "财务数据.html|financial-data.html"
  "报表中心.html|reports.html"
  "数据源管理.html|data-sources.html"
  "指标管理.html|metrics.html"
)

for page_pair in "${PAGE_PAIRS[@]}"; do
  zh_file="${page_pair%%|*}"
  en_file="${page_pair#*|}"

  zh_exists=0
  en_exists=0

  [ -f "$zh_file" ] && zh_exists=1
  [ -f "$en_file" ] && en_exists=1

  if [ $zh_exists -eq 1 ] && [ $en_exists -eq 1 ]; then
    zh_size=$(stat -c%s "$zh_file" 2>/dev/null || stat -f%z "$zh_file" 2>/dev/null)
    en_size=$(stat -c%s "$en_file" 2>/dev/null || stat -f%z "$en_file" 2>/dev/null)

    # 计算大小差异百分比
    if [ $zh_size -gt 0 ]; then
      diff_pct=$(echo "scale=1; ($zh_size - $en_size) * 100 / $zh_size" | bc 2>/dev/null || echo "0")
      abs_diff=$(echo "$diff_pct" | tr -d '-')
    else
      abs_diff="0"
    fi

    echo -e "${GREEN}✓${NC} $zh_file ↔ $en_file (${zh_size}B / ${en_size}B, 差 ${abs_diff}%)"
  else
    echo -e "${RED}✗${NC} 缺失: "
    [ $zh_exists -eq 0 ] && echo -e "    ${RED}  - $zh_file (中文)${NC}"
    [ $en_exists -eq 0 ] && echo -e "    ${RED}  - $en_file (英文)${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# ===== 2. 检查 sidebar.js 菜单配置 =====
echo "[2/4] 检查 sidebar.js 菜单配置..."
echo "------------------------------------------"

if [ ! -f "sidebar.js" ]; then
  echo -e "${RED}✗ sidebar.js 不存在${NC}"
  ERRORS=$((ERRORS + 1))
else
  # 统计菜单项数量
  menu_count=$(grep -c "path:" sidebar.js || echo "0")
  echo -e "${GREEN}✓${NC} sidebar.js 存在，含 $menu_count 个菜单项"

  # 检查关键函数
  if grep -q "injectSidebar" sidebar.js; then
    echo -e "${GREEN}✓${NC} injectSidebar 函数存在"
  else
    echo -e "${RED}✗${NC} injectSidebar 函数缺失"
    ERRORS=$((ERRORS + 1))
  fi

  # 检查 MENU_CONFIG
  if grep -q "MENU_CONFIG" sidebar.js; then
    echo -e "${GREEN}✓${NC} MENU_CONFIG 存在"
  else
    echo -e "${RED}✗${NC} MENU_CONFIG 缺失"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""

# ===== 3. 检查 lang-switch.js 映射 =====
echo "[3/4] 检查 lang-switch.js 双语映射..."
echo "------------------------------------------"

if [ ! -f "lang-switch.js" ]; then
  echo -e "${RED}✗ lang-switch.js 不存在${NC}"
  ERRORS=$((ERRORS + 1))
else
  if grep -q "BILINGUAL_PAGES" lang-switch.js; then
    echo -e "${GREEN}✓${NC} BILINGUAL_PAGES 映射存在"
    mapping_count=$(grep -c "\.html" lang-switch.js || echo "0")
    echo -e "${GREEN}✓${NC} 映射条目数: $mapping_count"
  else
    echo -e "${RED}✗${NC} BILINGUAL_PAGES 缺失"
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""

# ===== 4. 检查核心基础设施 =====
echo "[4/4] 检查核心基础设施文件..."
echo "------------------------------------------"

CORE_FILES=(
  "sidebar.js"
  "lang-switch.js"
  "bi-data.js"
  "bi-charts.js"
  "styles/main.css"
)

for file in "${CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    echo -e "${GREEN}✓${NC} $file (${size}B)"
  else
    echo -e "${RED}✗${NC} $file 不存在"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "=========================================="
echo "  检查完成"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}全部通过！0 错误，0 警告${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}有 $WARNINGS 个警告，0 个错误${NC}"
  exit 0
else
  echo -e "${RED}发现 $ERRORS 个错误，$WARNINGS 个警告${NC}"
  echo -e "${RED}请修复上述问题后再提交。${NC}"
  exit 1
fi
