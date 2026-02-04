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
# CHECK 6: Import resolution - verify all imports point to existing files
# -----------------------------------------------------------------------------
echo "=== CHECK 6: Import Resolution ==="
CHECK6_ERRORS=0

for proj in $PROJECTS; do
  # Extract all local imports from project-view.js and verify they exist
  for jsfile in project-view.js app.js; do
    if [[ -f "$proj/js/$jsfile" ]]; then
      # Extract imports like: from './foo.js' or from "./bar.js"
      imports=$(grep -oE "from ['\"]\\./[^'\"]+['\"]" "$proj/js/$jsfile" 2>/dev/null | sed "s/from ['\"]\\.\\/\\([^'\"]*\\)['\"].*/\\1/" || true)

      for import in $imports; do
        if [[ ! -f "$proj/js/$import" ]]; then
          red "  ❌ $proj: $jsfile imports '$import' but file does NOT exist"
          ERRORS=$((ERRORS + 1))
          CHECK6_ERRORS=$((CHECK6_ERRORS + 1))
        fi
      done
    fi
  done
done

if [[ $CHECK6_ERRORS -eq 0 ]]; then
  green "  ✅ All imports resolve to existing files"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 7: PRD-only files not imported elsewhere
# -----------------------------------------------------------------------------
echo "=== CHECK 7: PRD-Only Imports ==="
CHECK7_ERRORS=0

# Files that ONLY exist in product-requirements-assistant
PRD_ONLY_FILES="validator-inline.js"

for proj in $PROJECTS; do
  if [[ "$proj" == "product-requirements-assistant" ]]; then
    continue  # Skip PRD itself
  fi

  for prd_file in $PRD_ONLY_FILES; do
    # Check if any JS file imports this PRD-only file
    if grep -rq "from.*['\"].*${prd_file}['\"]" "$proj/js/" 2>/dev/null; then
      red "  ❌ $proj: imports PRD-only file '$prd_file' - THIS WILL BREAK THE APP!"
      ERRORS=$((ERRORS + 1))
      CHECK7_ERRORS=$((CHECK7_ERRORS + 1))
    fi
  done
done

if [[ $CHECK7_ERRORS -eq 0 ]]; then
  green "  ✅ No PRD-only imports in other projects"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 8: JavaScript syntax validation
# -----------------------------------------------------------------------------
echo "=== CHECK 8: JavaScript Syntax Validation ==="
CHECK8_ERRORS=0

# Check if node is available
if command -v node &> /dev/null; then
  for proj in $PROJECTS; do
    for jsfile in project-view.js workflow.js projects.js; do
      filepath="$proj/js/$jsfile"
      if [[ -f "$filepath" ]]; then
        # Use node to check syntax (--check flag)
        if ! node --check "$filepath" 2>/dev/null; then
          red "  ❌ $proj: $jsfile has SYNTAX ERRORS"
          ERRORS=$((ERRORS + 1))
          CHECK8_ERRORS=$((CHECK8_ERRORS + 1))
        fi
      fi
    done
  done

  if [[ $CHECK8_ERRORS -eq 0 ]]; then
    green "  ✅ All JS files pass syntax check"
  fi
else
  yellow "  ⚠️  Node.js not found - skipping syntax validation"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 9: getPhaseMetadata import consistency
# -----------------------------------------------------------------------------
echo "=== CHECK 9: getPhaseMetadata Import ==="
CHECK9_ERRORS=0

for proj in $PROJECTS; do
  # If showDiffModal uses getPhaseMetadata, it must be imported
  if grep -q "getPhaseMetadata" "$proj/js/project-view.js" 2>/dev/null; then
    if ! grep -q "getPhaseMetadata.*from.*workflow" "$proj/js/project-view.js" 2>/dev/null; then
      red "  ❌ $proj: uses getPhaseMetadata but doesn't import it from workflow.js"
      ERRORS=$((ERRORS + 1))
      CHECK9_ERRORS=$((CHECK9_ERRORS + 1))
    fi
  fi
done

if [[ $CHECK9_ERRORS -eq 0 ]]; then
  green "  ✅ getPhaseMetadata properly imported where used"
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

