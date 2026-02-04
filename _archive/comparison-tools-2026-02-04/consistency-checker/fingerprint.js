#!/usr/bin/env node
/**
 * Genesis Consistency Checker - Repository Fingerprint & Similarity Analyzer
 *
 * Generates digital fingerprints for Genesis-derived tool repos and compares
 * them for structural and content similarity. This is the authoritative tool
 * for detecting drift/entropy across repos that should share the same architecture.
 *
 * Usage:
 *   node fingerprint.js                    # Run from genesis-tools root
 *   node fingerprint.js --json             # Output JSON only
 *   node fingerprint.js --baseline         # Compare against saved baseline
 *   node fingerprint.js --save-baseline    # Save current state as baseline
 *
 * Scoring Scale:
 *   98-100: Nearly identical (only copy/prompts differ)
 *   95-97:  Same architecture, minor config drift
 *   90-94:  Same structure, some feature differences
 *   80-89:  Related but significant divergence
 *   <80:    Major structural differences - NEEDS ATTENTION
 *
 * @module consistency-checker/fingerprint
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Configuration - repos to analyze
const CONFIG = {
  // List of repos to analyze (relative to workspace root)
  repos: [
    "architecture-decision-record",
    "one-pager",
    "power-statement-assistant",
    "pr-faq-assistant",
    "product-requirements-assistant",
    "strategic-proposal",
  ],

  // Files that MUST exist in all repos (core architecture)
  coreFiles: {
    // Config files
    "package.json": { weight: 10, category: "config" },
    "jest.config.js": { weight: 5, category: "config" },
    "eslint.config.js": { weight: 3, category: "config" },
    // Main app
    "index.html": { weight: 10, category: "html" },
    // JS core modules
    "js/app.js": { weight: 10, category: "js-core" },
    "js/storage.js": { weight: 8, category: "js-core" },
    "js/ui.js": { weight: 8, category: "js-core" },
    "js/workflow.js": { weight: 8, category: "js-core" },
    "js/router.js": { weight: 6, category: "js-core" },
    "js/views.js": { weight: 6, category: "js-core" },
    "js/projects.js": { weight: 6, category: "js-core" },
    "js/project-view.js": { weight: 6, category: "js-core" },
    "js/types.js": { weight: 4, category: "js-core" },
    "js/error-handler.js": { weight: 4, category: "js-core" },
    "js/ai-mock.js": { weight: 3, category: "js-core" },
    "js/same-llm-adversarial.js": { weight: 5, category: "js-core" },
    // CSS
    "css/styles.css": { weight: 8, category: "css" },
    // Tests
    "tests/storage.test.js": { weight: 5, category: "tests" },
    "tests/workflow.test.js": { weight: 5, category: "tests" },
    "tests/ui.test.js": { weight: 4, category: "tests" },
    "tests/router.test.js": { weight: 4, category: "tests" },
    "tests/integration.test.js": { weight: 4, category: "tests" },
    // Docs
    "README.md": { weight: 3, category: "docs" },
    "CONTRIBUTING.md": { weight: 2, category: "docs" },
    "LICENSE": { weight: 1, category: "docs" },
    "docs/CLAUDE.md": { weight: 3, category: "docs" },
    "docs/DESIGN-PATTERNS.md": { weight: 2, category: "docs" },
    "docs/UI_STYLE_GUIDE.md": { weight: 2, category: "docs" },
    // CI/CD
    ".github/workflows/ci.yml": { weight: 4, category: "config" },
    "codecov.yml": { weight: 2, category: "config" },
  },

  // Optional files (no penalty for missing)
  optionalFiles: [
    "js/ai-mock-ui.js",
    "js/keyboard-shortcuts.js",
    "js/phase2-review.js",
    "js/phase3-review.js",
    "js/prompts.js",
    "js/attachments.js",
    "scripts/deploy-web.sh",
    ".pre-commit-config.yaml",
  ],

  // Code patterns to verify architectural consistency
  codePatterns: {
    "js/storage.js": [
      /DB_NAME|dbName|DATABASE/i,
      /indexedDB|openDatabase/i,
      /getAllProjects|getProjects/i,
      /saveProject|createProject/i,
      /deleteProject|removeProject/i,
    ],
    "js/workflow.js": [
      /WORKFLOW|PHASES|phases/,
      /phase.*\d|phaseNumber/i,
      /loadPromptTemplate|getPhasePrompt/i,
      /export/,
    ],
    "js/router.js": [/navigate|goto|route/i, /hash|location|path/i, /export/],
    "js/ui.js": [
      /showToast|toast|notification/i,
      /modal|dialog/i,
      /render|update|display/i,
      /export/,
    ],
  },

  // CRITICAL: Architectural patterns that MUST match the genesis template
  // These detect CLASS-based vs FUNCTION-based architecture divergence
  // Note: The genesis template has BOTH the Workflow class AND helper functions.
  // The issue is repos that have helper functions WITHOUT the class.
  architecturalPatterns: {
    "js/workflow.js": {
      name: "Workflow Class Architecture",
      required: [
        { pattern: /export\s+class\s+Workflow/, description: "Must export Workflow class" },
        { pattern: /advancePhase\s*\(/, description: "Must have advancePhase() method" },
        { pattern: /isComplete\s*\(/, description: "Must have isComplete() method" },
        { pattern: /getCurrentPhase\s*\(/, description: "Must have getCurrentPhase() method" },
        { pattern: /previousPhase\s*\(/, description: "Must have previousPhase() method" },
        { pattern: /constructor\s*\(\s*project/, description: "Must have constructor(project)" },
      ],
      // No forbidden patterns - helper functions are allowed alongside the class
      forbidden: [],
    },
  },

  // Baseline file location
  baselineFile: "consistency-checker/baseline.json",
};

// Utility functions
const hashFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return crypto.createHash("md5").update(content).digest("hex");
  } catch {
    return null;
  }
};

const getFileSize = (filePath) => {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
};

const checkPatterns = (filePath, patterns) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let matches = 0;
    for (const pattern of patterns) {
      if (pattern.test(content)) matches++;
    }
    return matches / patterns.length;
  } catch {
    return 0;
  }
};

// Check architectural patterns - returns detailed conformity report
const checkArchitecturalPatterns = (filePath, archConfig) => {
  const result = {
    conformant: true,
    score: 0,
    requiredMatches: [],
    requiredMissing: [],
    forbiddenViolations: [],
  };

  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Check required patterns
    for (const req of archConfig.required || []) {
      if (req.pattern.test(content)) {
        result.requiredMatches.push(req.description);
      } else {
        result.requiredMissing.push(req.description);
        result.conformant = false;
      }
    }

    // Check forbidden patterns
    for (const forbid of archConfig.forbidden || []) {
      if (forbid.pattern.test(content)) {
        result.forbiddenViolations.push(forbid.description);
        result.conformant = false;
      }
    }

    // Calculate score: % of required patterns matched, minus forbidden violations
    const requiredTotal = (archConfig.required || []).length;
    const requiredMatched = result.requiredMatches.length;
    const forbiddenCount = result.forbiddenViolations.length;

    if (requiredTotal > 0) {
      result.score = Math.max(0, (requiredMatched / requiredTotal) * 100 - forbiddenCount * 20);
    }
  } catch {
    result.conformant = false;
    result.score = 0;
    result.requiredMissing.push("File not readable");
  }

  return result;
};

const getAllFiles = (dir, baseDir = dir) => {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      if (["node_modules", ".git", "coverage", "dist"].includes(entry.name))
        continue;
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath, baseDir));
      } else {
        files.push(relativePath);
      }
    }
  } catch {
    /* ignore */
  }
  return files;
};

// Generate fingerprint for a single repo
function generateFingerprint(repoPath) {
  const fingerprint = {
    name: path.basename(repoPath),
    timestamp: new Date().toISOString(),
    structure: { totalFiles: 0, jsFiles: 0, testFiles: 0, docFiles: 0 },
    coreFiles: {},
    optionalFiles: {},
    patterns: {},
    hashes: {},
    architecture: {}, // NEW: Track architectural conformity
  };

  const allFiles = getAllFiles(repoPath);
  fingerprint.structure.totalFiles = allFiles.length;
  fingerprint.structure.jsFiles = allFiles.filter((f) => f.endsWith(".js")).length;
  fingerprint.structure.testFiles = allFiles.filter((f) => f.includes("test")).length;
  fingerprint.structure.docFiles = allFiles.filter((f) => f.endsWith(".md")).length;

  // Check core files
  for (const [file, meta] of Object.entries(CONFIG.coreFiles)) {
    const fullPath = path.join(repoPath, file);
    const exists = fs.existsSync(fullPath);
    fingerprint.coreFiles[file] = {
      exists,
      size: exists ? getFileSize(fullPath) : 0,
      hash: exists ? hashFile(fullPath) : null,
      weight: meta.weight,
      category: meta.category,
    };
    if (exists) {
      fingerprint.hashes[file] = fingerprint.coreFiles[file].hash;
    }
  }

  // Check optional files
  for (const file of CONFIG.optionalFiles) {
    fingerprint.optionalFiles[file] = fs.existsSync(path.join(repoPath, file));
  }

  // Check code patterns
  for (const [file, patterns] of Object.entries(CONFIG.codePatterns)) {
    fingerprint.patterns[file] = checkPatterns(path.join(repoPath, file), patterns);
  }

  // NEW: Check architectural patterns (CLASS-based vs FUNCTION-based)
  for (const [file, archConfig] of Object.entries(CONFIG.architecturalPatterns)) {
    const fullPath = path.join(repoPath, file);
    fingerprint.architecture[file] = checkArchitecturalPatterns(fullPath, archConfig);
    fingerprint.architecture[file].name = archConfig.name;
  }

  return fingerprint;
}

// Calculate similarity between two fingerprints
function calculateSimilarity(fp1, fp2) {
  let score = 100;

  // 1. Core file PRESENCE (30% weight - reduced from 40%)
  let corePresencePenalty = 0;
  let filesInBoth = 0;

  for (const [file, meta] of Object.entries(CONFIG.coreFiles)) {
    const in1 = fp1.coreFiles[file]?.exists || false;
    const in2 = fp2.coreFiles[file]?.exists || false;
    if (in1 && in2) {
      filesInBoth++;
    } else if (in1 !== in2) {
      corePresencePenalty += meta.weight * 0.3;
    }
  }

  // 2. Pattern conformity (25% weight - reduced from 35%)
  let patternScore = 0;
  let patternChecks = 0;
  for (const file of Object.keys(CONFIG.codePatterns)) {
    const p1 = fp1.patterns[file] || 0;
    const p2 = fp2.patterns[file] || 0;
    if (p1 >= 0.7 && p2 >= 0.7) {
      patternScore += 1;
    } else if (p1 > 0 && p2 > 0) {
      patternScore += 0.5;
    }
    patternChecks++;
  }
  const patternPenalty = patternChecks > 0 ? (1 - patternScore / patternChecks) * 12 : 0;

  // 3. ARCHITECTURAL CONFORMITY (25% weight - NEW AND CRITICAL)
  // This catches CLASS-based vs FUNCTION-based divergence
  let architecturePenalty = 0;
  for (const file of Object.keys(CONFIG.architecturalPatterns)) {
    const arch1 = fp1.architecture?.[file];
    const arch2 = fp2.architecture?.[file];
    if (arch1 && arch2) {
      // Both must be conformant, or both non-conformant
      if (arch1.conformant !== arch2.conformant) {
        architecturePenalty += 15; // MAJOR penalty for architectural mismatch
      } else if (!arch1.conformant && !arch2.conformant) {
        // Both non-conformant - still bad but at least consistent
        architecturePenalty += 5;
      }
    }
  }

  // 4. Config file drift (10% weight - reduced from 15%)
  let configMismatchPenalty = 0;
  const configFiles = ["package.json", "jest.config.js", "eslint.config.js", ".github/workflows/ci.yml"];
  for (const file of configFiles) {
    const h1 = fp1.hashes[file];
    const h2 = fp2.hashes[file];
    if (h1 && h2 && h1 !== h2) {
      configMismatchPenalty += 1.0;
    }
  }

  // 5. Test coverage structure (5% weight - reduced from 10%)
  let testPenalty = 0;
  const testFiles = Object.keys(CONFIG.coreFiles).filter((f) => f.includes("test"));
  for (const file of testFiles) {
    const in1 = fp1.coreFiles[file]?.exists || false;
    const in2 = fp2.coreFiles[file]?.exists || false;
    if (in1 !== in2) {
      testPenalty += 1;
    }
  }

  // 6. Optional file alignment (5% weight)
  let optionalDiff = 0;
  for (const file of CONFIG.optionalFiles) {
    if (fp1.optionalFiles[file] !== fp2.optionalFiles[file]) {
      optionalDiff += 0.5;
    }
  }

  score -= corePresencePenalty + patternPenalty + architecturePenalty + configMismatchPenalty + testPenalty + optionalDiff;

  return {
    score: Math.max(0, Math.min(100, Math.round(score * 10) / 10)),
    penalties: {
      corePresence: Math.round(corePresencePenalty * 10) / 10,
      patterns: Math.round(patternPenalty * 10) / 10,
      architecture: Math.round(architecturePenalty * 10) / 10, // NEW
      configDrift: Math.round(configMismatchPenalty * 10) / 10,
      testCoverage: Math.round(testPenalty * 10) / 10,
      optional: Math.round(optionalDiff * 10) / 10,
    },
    filesInBoth,
    totalCoreFiles: Object.keys(CONFIG.coreFiles).length,
  };
}



// Color output helpers
const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const colorScore = (score) => {
  if (score >= 98) return colors.green(score.toFixed(1));
  if (score >= 95) return colors.cyan(score.toFixed(1));
  if (score >= 90) return colors.yellow(score.toFixed(1));
  if (score >= 80) return score.toFixed(1);
  return colors.red(score.toFixed(1));
};

// Main execution
function main() {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes("--json");
  const saveBaseline = args.includes("--save-baseline");
  const compareBaseline = args.includes("--baseline");

  // Determine workspace root
  // The tool repos are siblings of genesis/, not inside it
  let baseDir = process.cwd();

  // If running from inside genesis/consistency-checker/, go up to workspace root
  if (baseDir.endsWith("consistency-checker")) {
    baseDir = path.resolve(baseDir, "../..");
  } else if (baseDir.endsWith("genesis")) {
    baseDir = path.resolve(baseDir, "..");
  }
  // Otherwise assume we're at the workspace root already

  if (!jsonOnly) {
    console.log(colors.bold("\n🔍 Genesis Consistency Checker\n"));
    console.log("=".repeat(65));
  }

  // Generate fingerprints
  const fingerprints = {};
  if (!jsonOnly) console.log("\n📊 Analyzing repositories...\n");

  for (const repo of CONFIG.repos) {
    const repoPath = path.join(baseDir, repo);
    if (!fs.existsSync(repoPath)) {
      if (!jsonOnly) console.log(`  ⚠️  ${repo} - not found`);
      continue;
    }
    fingerprints[repo] = generateFingerprint(repoPath);
    if (!jsonOnly) {
      const fp = fingerprints[repo];
      console.log(`  ✓ ${repo}: ${fp.structure.totalFiles} files, ${fp.structure.jsFiles} JS`);
    }
  }

  // Build similarity matrix
  const matrix = [];
  const repos = Object.keys(fingerprints);

  for (const repo1 of repos) {
    const row = [];
    for (const repo2 of repos) {
      if (repo1 === repo2) {
        row.push(100);
      } else {
        const result = calculateSimilarity(fingerprints[repo1], fingerprints[repo2]);
        row.push(result.score);
      }
    }
    matrix.push(row);
  }

  // Calculate statistics
  let totalScore = 0, comparisons = 0;
  let maxScore = 0, maxPair = [];
  let minScore = 100, minPair = [];

  for (let i = 0; i < repos.length; i++) {
    for (let j = i + 1; j < repos.length; j++) {
      const score = matrix[i][j];
      totalScore += score;
      comparisons++;
      if (score > maxScore) { maxScore = score; maxPair = [repos[i], repos[j]]; }
      if (score < minScore) { minScore = score; minPair = [repos[i], repos[j]]; }
    }
  }
  const avgSimilarity = comparisons > 0 ? totalScore / comparisons : 0;

  // Output results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      averageSimilarity: Math.round(avgSimilarity * 10) / 10,
      mostSimilar: { pair: maxPair, score: maxScore },
      leastSimilar: { pair: minPair, score: minScore },
      comparisons,
    },
    fingerprints,
    matrix,
    repos,
  };

  if (jsonOnly) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Print matrix
  console.log("\n" + "=".repeat(65));
  console.log(colors.bold("\n📐 SIMILARITY MATRIX\n"));

  const shortNames = repos.map((r) => r.substring(0, 8).padEnd(9));
  console.log("            " + shortNames.join(""));
  console.log("-".repeat(12 + repos.length * 9));

  for (let i = 0; i < repos.length; i++) {
    const row = [repos[i].substring(0, 10).padEnd(12)];
    for (let j = 0; j < repos.length; j++) {
      if (i === j) {
        row.push(colors.gray("100.0".padEnd(9)));
      } else {
        row.push(colorScore(matrix[i][j]).padEnd(18)); // Extra padding for color codes
      }
    }
    console.log(row.join(""));
  }

  // Print summary
  console.log("\n" + "=".repeat(65));
  console.log(colors.bold("\n📈 SUMMARY\n"));
  console.log(`  Average similarity: ${colorScore(avgSimilarity)}%`);
  console.log(`  Most similar:  ${maxPair.join(" ↔ ")} (${maxScore}%)`);
  console.log(`  Least similar: ${minPair.join(" ↔ ")} (${minScore}%)`);

  // ARCHITECTURAL ISSUES - Show these FIRST and PROMINENTLY
  console.log("\n" + "=".repeat(65));
  console.log(colors.bold("\n🏗️  ARCHITECTURAL CONFORMITY\n"));

  let hasArchIssues = false;
  for (const repo of repos) {
    const fp = fingerprints[repo];
    for (const [file, arch] of Object.entries(fp.architecture || {})) {
      if (!arch.conformant) {
        hasArchIssues = true;
        console.log(`  ${colors.red("❌")} ${colors.bold(repo)} - ${arch.name}`);
        if (arch.requiredMissing.length > 0) {
          console.log(`    ${colors.red("Missing:")} ${arch.requiredMissing.join("; ")}`);
        }
        if (arch.forbiddenViolations.length > 0) {
          console.log(`    ${colors.red("Violations:")} ${arch.forbiddenViolations.join("; ")}`);
        }
      }
    }
  }
  if (!hasArchIssues) {
    console.log(`  ${colors.green("✓")} All repos conform to genesis architecture`);
  }

  // Per-repo analysis
  console.log("\n" + "=".repeat(65));
  console.log(colors.bold("\n📋 PER-REPO ISSUES\n"));

  for (const repo of repos) {
    const fp = fingerprints[repo];
    const missingCore = Object.entries(fp.coreFiles)
      .filter(([_, v]) => !v.exists)
      .map(([k]) => k);

    // Check architectural conformity
    const archIssues = [];
    for (const [file, arch] of Object.entries(fp.architecture || {})) {
      if (!arch.conformant) {
        archIssues.push(`${file}: ${arch.name} FAILED`);
      }
    }

    const repoIdx = repos.indexOf(repo);
    let avgToOthers = 0;
    for (let i = 0; i < repos.length; i++) {
      if (i !== repoIdx) avgToOthers += matrix[repoIdx][i];
    }
    avgToOthers /= repos.length - 1;

    console.log(`  ${colors.bold(repo)} (${colorScore(avgToOthers)}% avg)`);

    // Show architectural issues FIRST - these are critical
    if (archIssues.length > 0) {
      console.log(`    ${colors.red("🚨 ARCHITECTURE:")} ${archIssues.join(", ")}`);
    }

    if (missingCore.length > 0) {
      console.log(`    ${colors.yellow("⚠️  Missing:")} ${missingCore.join(", ")}`);
    }

    if (archIssues.length === 0 && missingCore.length === 0) {
      console.log(`    ${colors.green("✓")} Full conformity`);
    }
  }

  // Save baseline if requested
  if (saveBaseline) {
    const baselinePath = path.join(baseDir, "genesis", CONFIG.baselineFile);
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Baseline saved to: genesis/${CONFIG.baselineFile}`);
  }

  // Compare to baseline if requested
  if (compareBaseline) {
    const baselinePath = path.join(baseDir, "genesis", CONFIG.baselineFile);
    if (fs.existsSync(baselinePath)) {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
      const diff = avgSimilarity - baseline.summary.averageSimilarity;
      console.log("\n" + "=".repeat(65));
      console.log(colors.bold("\n📊 BASELINE COMPARISON\n"));
      console.log(`  Baseline: ${baseline.summary.averageSimilarity}% (${baseline.timestamp})`);
      console.log(`  Current:  ${avgSimilarity.toFixed(1)}%`);
      console.log(`  Change:   ${diff >= 0 ? colors.green("+" + diff.toFixed(1)) : colors.red(diff.toFixed(1))}%`);
    } else {
      console.log(`\n⚠️  No baseline found. Run with --save-baseline first.`);
    }
  }

  console.log("\n" + "=".repeat(65));
  console.log(colors.green("\n✅ Analysis complete!\n"));
}

main();