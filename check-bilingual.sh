#!/usr/bin/env bash
# check-bilingual.sh — 双语一致性检查脚本
# 检查所有中文页面是否有对应的英文页面（kebab-case），反之亦然
# 用法: ./check-bilingual.sh
# 返回: 0 = 全部通过，1 = 有缺失

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 双语页面映射表（必须与 lang-switch.js 中的 BILINGUAL_PAGES 保持一致）
# 格式: "中文名.html|英文名.html"
declare -a PAGE_PAIRS=(
  "报表中心.html|reports.html"
  "数据源管理.html|data-sources.html"
  "指标管理.html|metrics.html"
)

# 首页特殊处理
INDEX_FILE="index.html"

ERRORS=0
WARNINGS=0
PASSED=0

echo "========================================"
echo "  BI System Bilingual Consistency Check"
echo "========================================"
echo ""

# 1. 检查首页
echo "[1/4] Checking index page..."
if [ -f "$INDEX_FILE" ]; then
  echo "  ✓ $INDEX_FILE exists (bilingual single page)"
  PASSED=$((PASSED + 1))
else
  echo "  ✗ $INDEX_FILE NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. 检查成对页面
echo "[2/4] Checking bilingual page pairs..."
for pair in "${PAGE_PAIRS[@]}"; do
  zh_file="${pair%%|*}"
  en_file="${pair##*|}"

  zh_exists=0
  en_exists=0

  if [ -f "$zh_file" ]; then
    zh_exists=1
  fi
  if [ -f "$en_file" ]; then
    en_exists=1
  fi

  if [ $zh_exists -eq 1 ] && [ $en_exists -eq 1 ]; then
    echo "  ✓ $zh_file ↔ $en_file"
    PASSED=$((PASSED + 1))
  elif [ $zh_exists -eq 1 ] && [ $en_exists -eq 0 ]; then
    echo "  ✗ $zh_file exists but $en_file MISSING"
    ERRORS=$((ERRORS + 1))
  elif [ $zh_exists -eq 0 ] && [ $en_exists -eq 1 ]; then
    echo "  ✗ $en_file exists but $zh_file MISSING"
    ERRORS=$((ERRORS + 1))
  else
    echo "  ! Both $zh_file and $en_file missing (skipped)"
    WARNINGS=$((WARNINGS + 1))
  fi
done
echo ""

# 3. 检查 sidebar.js 菜单配置中的文件引用
echo "[3/4] Checking sidebar.js menu references..."
if [ -f "sidebar.js" ]; then
  MENU_ZH=$(grep -Eo "zhFile:[[:space:]]*['\"][^'\"]+['\"]" sidebar.js | sed -E 's/zhFile:[[:space:]]*//' | tr -d "'\"" | grep -v '^#$' | sort -u)
  MENU_EN=$(grep -Eo "enFile:[[:space:]]*['\"][^'\"]+['\"]" sidebar.js | sed -E 's/enFile:[[:space:]]*//' | tr -d "'\"" | grep -v '^#$' | sort -u)

  for f in $MENU_ZH; do
    if [ "$f" = "#" ]; then continue; fi
    if [ -f "$f" ]; then
      echo "  ✓ sidebar.js → $f"
    else
      echo "  ⚠ sidebar.js references $f but file not found"
      WARNINGS=$((WARNINGS + 1))
    fi
  done

  for f in $MENU_EN; do
    if [ "$f" = "#" ]; then continue; fi
    if [ -f "$f" ]; then
      echo "  ✓ sidebar.js → $f"
    else
      echo "  ⚠ sidebar.js references $f but file not found"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
  PASSED=$((PASSED + 1))
else
  echo "  ✗ sidebar.js NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. 检查 lang-switch.js 映射表
echo "[4/4] Checking lang-switch.js bilingual map..."
if [ -f "lang-switch.js" ]; then
  MAP_COUNT=$(grep -Ec "['\"][^'\"]+\.html['\"]" lang-switch.js || true)
  echo "  ✓ lang-switch.js found with ~$MAP_COUNT page entries"
  PASSED=$((PASSED + 1))
else
  echo "  ✗ lang-switch.js NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 总结
echo "========================================"
echo "  Summary"
echo "========================================"
echo "  Passed:   $PASSED"
echo "  Warnings: $WARNINGS"
echo "  Errors:   $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "RESULT: FAILED — $ERRORS error(s) found"
  exit 1
else
  echo "RESULT: PASSED — All bilingual checks passed"
  if [ $WARNINGS -gt 0 ]; then
    echo "        ($WARNINGS warning(s), please review)"
  fi
  exit 0
fi
