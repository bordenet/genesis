/**
 * Workflow Consistency Scanner (Outside-In)
 * Checks 3-phase workflow implementation consistency.
 *
 * @module scanners/outside-in/workflow-consistency
 */

import path from 'path';
import { fileExists, getAllFiles, readTextFile, detectProjectStructure } from '../../lib/config-parser.js';
import { calculateEntropy } from '../../lib/entropy.js';

const DIMENSION_NAME = 'Workflow Consistency';

// Expected workflow phases
const EXPECTED_PHASES = ['phase1', 'phase2', 'phase3'];
const EXPECTED_FILES = {
  'phase2-review': 'Phase 2 review module',
  'phase3-synthesis': 'Phase 3 synthesis module',
  'same-llm-adversarial': 'Same-LLM adversarial module',
  'workflow': 'Workflow orchestration',
};

/**
 * Check workflow file presence.
 */
function checkWorkflowFiles(jsDir) {
  if (!fileExists(jsDir)) return { present: [], missing: Object.keys(EXPECTED_FILES) };

  const files = getAllFiles(jsDir).filter((f) => f.endsWith('.js'));
  const basenames = files.map((f) => path.basename(f, '.js'));

  const present = [];
  const missing = [];

  for (const expected of Object.keys(EXPECTED_FILES)) {
    if (basenames.includes(expected)) {
      present.push(expected);
    } else {
      missing.push(expected);
    }
  }

  return { present, missing };
}

/**
 * Check prompt files for all phases.
 */
function checkPromptFiles(repoPath, structure) {
  const promptDirs = structure.type === 'paired'
    ? [path.join(repoPath, 'assistant', 'prompts'), path.join(repoPath, 'prompts')]
    : [path.join(repoPath, 'prompts')];

  const foundPhases = new Set();
  const missing = [];

  for (const promptDir of promptDirs) {
    if (!fileExists(promptDir)) continue;
    const files = getAllFiles(promptDir);
    for (const file of files) {
      const basename = path.basename(file).toLowerCase();
      for (const phase of EXPECTED_PHASES) {
        if (basename.includes(phase)) {
          foundPhases.add(phase);
        }
      }
    }
  }

  for (const phase of EXPECTED_PHASES) {
    if (!foundPhases.has(phase)) {
      missing.push(phase);
    }
  }

  return {
    foundPhases: Array.from(foundPhases),
    missing,
    complete: missing.length === 0,
  };
}

/**
 * Analyze workflow for a repo.
 */
function analyzeRepo(repoPath) {
  const structure = detectProjectStructure(repoPath);
  const repoName = path.basename(repoPath);

  // Check main JS dir for workflow files
  const mainJsDir = structure.jsDirs[0];
  const workflowFiles = checkWorkflowFiles(mainJsDir);

  // Check prompts
  const promptStatus = checkPromptFiles(repoPath, structure);

  // Calculate workflow completeness
  const workflowScore = workflowFiles.present.length / Object.keys(EXPECTED_FILES).length;
  const promptScore = promptStatus.foundPhases.length / EXPECTED_PHASES.length;

  return {
    repo: repoName,
    workflowFiles,
    promptStatus,
    workflowScore,
    promptScore,
    overallScore: (workflowScore + promptScore) / 2,
  };
}

/**
 * Scan workflow consistency across repos.
 */
export async function scan(repoPaths) {
  const repoData = repoPaths.map(analyzeRepo);

  const overallScores = repoData.map((r) => r.overallScore);
  const workflowScores = repoData.map((r) => r.workflowScore);
  const promptScores = repoData.map((r) => r.promptScore);

  const findings = [];
  for (const r of repoData) {
    if (r.workflowFiles.missing.length > 0) {
      findings.push({
        repo: r.repo,
        severity: 'high',
        summary: `Missing workflow files: ${r.workflowFiles.missing.join(', ')}`,
        details: `Expected workflow files not found in JS directory`,
      });
    }
    if (r.promptStatus.missing.length > 0) {
      findings.push({
        repo: r.repo,
        severity: 'medium',
        summary: `Missing prompt phases: ${r.promptStatus.missing.join(', ')}`,
        details: `Expected prompt files for all 3 phases`,
      });
    }
  }

  const overallEntropy = calculateEntropy(overallScores);

  return {
    name: DIMENSION_NAME,
    entropy: Math.round(overallEntropy * 10) / 10,
    repoData,
    uniformity: {
      overall: { values: overallScores, entropy: overallEntropy },
      workflow: { values: workflowScores, entropy: calculateEntropy(workflowScores) },
      prompts: { values: promptScores, entropy: calculateEntropy(promptScores) },
    },
    findings,
  };
}

