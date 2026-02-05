/**
 * Tests for shared library naming anti-pattern detection.
 *
 * CONTEXT: Shared libraries in genesis projects should use GENERIC function names,
 * not document-specific names. For example, validator-inline.js should export
 * `validateDocument`, not `validateProposal`, `validateOnePager`, `validateADR`, etc.
 *
 * This test directly scans the actual project files to verify compliance.
 * TDD-style: We define what "correct" looks like, then verify all projects match.
 */

import { describe, test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to genesis-tools directory (5 levels up from this test file)
const GENESIS_TOOLS_DIR = path.resolve(__dirname, '../../../../..');

// All 9 projects (8 derived + hello-world baseline)
const PROJECTS = [
  'acceptance-criteria-assistant',
  'architecture-decision-record',
  'jd-assistant',
  'one-pager',
  'power-statement-assistant',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
  'genesis/genesis/examples/hello-world',
];

// Document-specific terms that should NOT appear in shared library function names
// These are the ANTI-PATTERNS we're detecting
const DOCUMENT_SPECIFIC_TERMS = [
  'Proposal',        // validateProposal, exportProposal, etc.
  'OnePager',        // validateOnePager
  'ADR',             // validateADR
  'PRFAQ',           // validatePRFAQ
  'PRD',             // validatePRD (but NOT PRDGenerated which is a different pattern)
  'PowerStatement',  // validatePowerStatement
  'StrategicProposal', // validateStrategicProposal
  'AcceptanceCriteria', // validateAcceptanceCriteria
  'JobDescription',  // validateJobDescription
];

// Shared library files that MUST use generic function names
// These files are meant to be identical (or nearly identical) across projects
const SHARED_LIBRARY_FILES = [
  'assistant/js/validator-inline.js',
  'js/validator-inline.js',
  // Note: jd-assistant uses jd-validator.js which is project-specific by design
];

/**
 * Extract all exported function names from a JavaScript file
 */
function extractExportedFunctionNames(filePath) {
  const functionNames = [];

  if (!fs.existsSync(filePath)) {
    return functionNames;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Pattern to match exported functions
  const patterns = [
    /^export\s+(?:async\s+)?function\s+(\w+)/,           // export function name(
    /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(/,    // export const name = (
    /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?function/, // export const name = function
  ];

  lines.forEach((line, lineNum) => {
    const trimmed = line.trim();
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        functionNames.push({
          name: match[1],
          line: lineNum + 1,
        });
        break;
      }
    }
  });

  return functionNames;
}

/**
 * Check if a function name contains document-specific terms
 */
function isDocumentSpecificName(functionName) {
  for (const term of DOCUMENT_SPECIFIC_TERMS) {
    // Case-sensitive match - look for the term in the function name
    if (functionName.includes(term)) {
      return { isAntiPattern: true, term };
    }
  }
  return { isAntiPattern: false, term: null };
}

describe('Shared Library Naming Convention', () => {

  test('validator-inline.js should export validateDocument, not project-specific names', () => {
    const antiPatterns = [];

    for (const project of PROJECTS) {
      // Skip jd-assistant - it uses jd-validator.js which is project-specific by design
      if (project === 'jd-assistant') continue;

      for (const file of SHARED_LIBRARY_FILES) {
        const filePath = path.join(GENESIS_TOOLS_DIR, project, file);
        const functions = extractExportedFunctionNames(filePath);

        for (const func of functions) {
          const { isAntiPattern, term } = isDocumentSpecificName(func.name);
          if (isAntiPattern) {
            antiPatterns.push({
              project,
              file,
              functionName: func.name,
              line: func.line,
              term,
              suggestedName: func.name.replace(term, 'Document'),
            });
          }
        }
      }
    }

    // ASSERTION: There should be ZERO anti-patterns
    // If this test fails, it lists all the violations
    if (antiPatterns.length > 0) {
      const violations = antiPatterns.map(ap =>
        `  - ${ap.project}/${ap.file}:${ap.line} - ${ap.functionName} (contains "${ap.term}", suggest: ${ap.suggestedName})`
      ).join('\n');

      expect(antiPatterns).toEqual([]); // This will show the violations in the error message
    }

    expect(antiPatterns.length).toBe(0);
  });

  test('all validator-inline.js files should export validateDocument function', () => {
    const projectsMissingValidateDocument = [];

    for (const project of PROJECTS) {
      // Skip jd-assistant - it uses jd-validator.js
      if (project === 'jd-assistant') continue;

      const filePath = path.join(GENESIS_TOOLS_DIR, project, 'assistant/js/validator-inline.js');

      if (!fs.existsSync(filePath)) {
        // Skip projects without validator-inline.js (shouldn't happen but be safe)
        continue;
      }

      const functions = extractExportedFunctionNames(filePath);
      const hasValidateDocument = functions.some(f => f.name === 'validateDocument');

      if (!hasValidateDocument) {
        const actualFunctionNames = functions.map(f => f.name).join(', ');
        projectsMissingValidateDocument.push({
          project,
          actualFunctions: actualFunctionNames || '(none found)',
        });
      }
    }

    // ASSERTION: All projects should have validateDocument
    if (projectsMissingValidateDocument.length > 0) {
      const missing = projectsMissingValidateDocument.map(p =>
        `  - ${p.project}: exports [${p.actualFunctions}] but not validateDocument`
      ).join('\n');

      fail(`Projects missing validateDocument export:\n${missing}`);
    }

    expect(projectsMissingValidateDocument.length).toBe(0);
  });

  test('getScoreColor and getScoreLabel should be the standard names (not document-specific)', () => {
    const antiPatterns = [];

    for (const project of PROJECTS) {
      if (project === 'jd-assistant') continue;

      const filePath = path.join(GENESIS_TOOLS_DIR, project, 'assistant/js/validator-inline.js');
      if (!fs.existsSync(filePath)) continue;

      const functions = extractExportedFunctionNames(filePath);

      // Check for document-specific score functions
      for (const func of functions) {
        if (func.name.includes('Score') || func.name.includes('Color') || func.name.includes('Label')) {
          const { isAntiPattern, term } = isDocumentSpecificName(func.name);
          if (isAntiPattern) {
            antiPatterns.push({
              project,
              functionName: func.name,
              term,
            });
          }
        }
      }
    }

    expect(antiPatterns.length).toBe(0);
  });
});

