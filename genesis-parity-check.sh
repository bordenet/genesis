#!/bin/bash
# Genesis Parity Check - Catches consistency issues across all 6 assistants
# Run from genesis-tools directory: ./genesis-parity-check.sh
#
# EXIT CODES:
#   0 = All checks pass
#   1 = Parity violations found

set -euo pipefail

PROJECTS="architecture-decision-record one-pager power-statement-assistant pr-faq-assistant product-requirements-assistant strategic-proposal"
ERRORS=0

red() { echo -e "\033[0;31m$1\033[0m"; }
green() { echo -e "\033[0;32m$1\033[0m"; }
yellow() { echo -e "\033[0;33m$1\033[0m"; }

echo "=============================================="
echo "  GENESIS PARITY CHECK"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# CHECK 1: Root vs Assistant file sync
# -----------------------------------------------------------------------------
echo "=== CHECK 1: Root vs Assistant JS File Sync ==="
SYNC_FILES="projects.js workflow.js project-view.js diff-view.js prompts.js"

for proj in $PROJECTS; do
  for file in $SYNC_FILES; do
    root_file="$proj/js/$file"
    asst_file="$proj/assistant/js/$file"
    
    if [[ -f "$root_file" && -f "$asst_file" ]]; then
      if ! diff -q "$root_file" "$asst_file" > /dev/null 2>&1; then
        red "  ❌ $proj: $file differs between root and assistant"
        ERRORS=$((ERRORS + 1))
      fi
    elif [[ -f "$asst_file" && ! -f "$root_file" ]]; then
      red "  ❌ $proj: $file exists in assistant/ but MISSING from root"
      ERRORS=$((ERRORS + 1))
    elif [[ -f "$root_file" && ! -f "$asst_file" ]]; then
      red "  ❌ $proj: $file exists in root but MISSING from assistant/"
      ERRORS=$((ERRORS + 1))
    fi
  done
done

if [[ $ERRORS -eq 0 ]]; then
  green "  ✅ All synced files match"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 2: Required JS files exist in all projects
# -----------------------------------------------------------------------------
echo "=== CHECK 2: Required JS Files Exist ==="
REQUIRED_JS="app.js projects.js workflow.js project-view.js prompts.js storage.js ui.js diff-view.js"

for proj in $PROJECTS; do
  for file in $REQUIRED_JS; do
    if [[ ! -f "$proj/js/$file" ]]; then
      red "  ❌ $proj: MISSING js/$file"
      ERRORS=$((ERRORS + 1))
    fi
    if [[ ! -f "$proj/assistant/js/$file" ]]; then
      red "  ❌ $proj: MISSING assistant/js/$file"
      ERRORS=$((ERRORS + 1))
    fi
  done
done

if [[ $ERRORS -eq 0 ]]; then
  green "  ✅ All required files exist"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 3: WORKFLOW_CONFIG structure consistency
# -----------------------------------------------------------------------------
echo "=== CHECK 3: WORKFLOW_CONFIG Structure ==="

for proj in $PROJECTS; do
  # Check phases have 'name' not 'title'
  if grep -q "title:" "$proj/js/prompts.js" 2>/dev/null; then
    red "  ❌ $proj: prompts.js uses 'title' instead of 'name' in phases"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check project-view.js uses meta.name not meta.title
  if grep -q "meta\.title" "$proj/js/project-view.js" 2>/dev/null; then
    red "  ❌ $proj: project-view.js uses meta.title (should be meta.name)"
    ERRORS=$((ERRORS + 1))
  fi
done

if [[ $ERRORS -eq 0 ]]; then
  green "  ✅ WORKFLOW_CONFIG structure consistent"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 4: Diff feature wiring
# -----------------------------------------------------------------------------
echo "=== CHECK 4: Diff Feature Wiring ==="

for proj in $PROJECTS; do
  # Check diff-view.js import exists
  if ! grep -q "from './diff-view.js'" "$proj/js/project-view.js" 2>/dev/null; then
    red "  ❌ $proj: project-view.js missing diff-view.js import"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check showDiffModal function exists
  if ! grep -q "showDiffModal" "$proj/js/project-view.js" 2>/dev/null; then
    red "  ❌ $proj: project-view.js missing showDiffModal function"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check compare-phases-btn handler exists
  if ! grep -q "compare-phases-btn" "$proj/js/project-view.js" 2>/dev/null; then
    red "  ❌ $proj: project-view.js missing compare-phases-btn handler"
    ERRORS=$((ERRORS + 1))
  fi
done

if [[ $ERRORS -eq 0 ]]; then
  green "  ✅ Diff feature properly wired"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 5: Prompt files exist
# -----------------------------------------------------------------------------
echo "=== CHECK 5: Prompt Files ==="

for proj in $PROJECTS; do
  for phase in 1 2 3; do
    if [[ ! -f "$proj/prompts/phase${phase}.md" ]]; then
      red "  ❌ $proj: MISSING prompts/phase${phase}.md"
      ERRORS=$((ERRORS + 1))
    fi
  done
done

if [[ $ERRORS -eq 0 ]]; then
  green "  ✅ All prompt files exist"
fi
echo ""

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------
echo "=============================================="
if [[ $ERRORS -eq 0 ]]; then
  green "  ✅ ALL PARITY CHECKS PASSED"
  exit 0
else
  red "  ❌ $ERRORS PARITY VIOLATIONS FOUND"
  exit 1
fi

