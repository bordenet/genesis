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

  return fingerprint;
}

// Calculate similarity between two fingerprints
function calculateSimilarity(fp1, fp2) {
  let score = 100;

  // 1. Core file PRESENCE (40% weight)
  let corePresencePenalty = 0;
  let filesInBoth = 0;

  for (const [file, meta] of Object.entries(CONFIG.coreFiles)) {
    const in1 = fp1.coreFiles[file]?.exists || false;
    const in2 = fp2.coreFiles[file]?.exists || false;
    if (in1 && in2) {
      filesInBoth++;
    } else if (in1 !== in2) {
      corePresencePenalty += meta.weight * 0.4;
    }
  }

  // 2. Pattern conformity (35% weight)
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
  const patternPenalty = patternChecks > 0 ? (1 - patternScore / patternChecks) * 15 : 0;

  // 3. Config file drift (15% weight)
  let configMismatchPenalty = 0;
  const configFiles = ["package.json", "jest.config.js", "eslint.config.js", ".github/workflows/ci.yml"];
  for (const file of configFiles) {
    const h1 = fp1.hashes[file];
    const h2 = fp2.hashes[file];
    if (h1 && h2 && h1 !== h2) {
      configMismatchPenalty += 1.5;
    }
  }

  // 4. Test coverage structure (10% weight)
  let testPenalty = 0;
  const testFiles = Object.keys(CONFIG.coreFiles).filter((f) => f.includes("test"));
  for (const file of testFiles) {
    const in1 = fp1.coreFiles[file]?.exists || false;
    const in2 = fp2.coreFiles[file]?.exists || false;
    if (in1 !== in2) {
      testPenalty += 2;
    }
  }

  // 5. Optional file alignment (5% weight)
  let optionalDiff = 0;
  for (const file of CONFIG.optionalFiles) {
    if (fp1.optionalFiles[file] !== fp2.optionalFiles[file]) {
      optionalDiff += 0.5;
    }
  }

  score -= corePresencePenalty + patternPenalty + configMismatchPenalty + testPenalty + optionalDiff;

  return {
    score: Math.max(0, Math.min(100, Math.round(score * 10) / 10)),
    penalties: {
      corePresence: Math.round(corePresencePenalty * 10) / 10,
      patterns: Math.round(patternPenalty * 10) / 10,
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

  // Per-repo analysis
  console.log("\n" + "=".repeat(65));
  console.log(colors.bold("\n📋 PER-REPO ISSUES\n"));

  for (const repo of repos) {
    const fp = fingerprints[repo];
    const missingCore = Object.entries(fp.coreFiles)
      .filter(([_, v]) => !v.exists)
      .map(([k]) => k);

    const repoIdx = repos.indexOf(repo);
    let avgToOthers = 0;
    for (let i = 0; i < repos.length; i++) {
      if (i !== repoIdx) avgToOthers += matrix[repoIdx][i];
    }
    avgToOthers /= repos.length - 1;

    console.log(`  ${colors.bold(repo)} (${colorScore(avgToOthers)}% avg)`);
    if (missingCore.length > 0) {
      console.log(`    ${colors.yellow("⚠️  Missing:")} ${missingCore.join(", ")}`);
    } else {
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