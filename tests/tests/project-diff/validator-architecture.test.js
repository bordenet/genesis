/**
 * Tests for validator architecture consistency across genesis projects.
 *
 * CONTEXT: All genesis validators should follow the standard pattern:
 * - detect*() functions: Return what was FOUND (boolean flags, counts, indicators)
 * - score*() functions: Return a SCORE based on detection results
 * - validate*() functions: Aggregate scores into final result
 *
 * This test ensures all projects export the required function patterns.
 */

import { describe, test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to genesis-tools directory
const GENESIS_TOOLS_DIR = path.resolve(__dirname, '../../../..');

// All 8 derived projects (excluding hello-world template)
const DERIVED_PROJECTS = [
  'acceptance-criteria-assistant',
  'architecture-decision-record',
  'jd-assistant',
  'one-pager',
  'power-statement-assistant',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
];

/**
 * Extract exported function names from a validator.js file
 */
function getExportedFunctions(validatorPath) {
  if (!fs.existsSync(validatorPath)) {
    return { detect: [], score: [], validate: [], other: [] };
  }
  
  const content = fs.readFileSync(validatorPath, 'utf-8');
  const exportPattern = /export\s+function\s+(\w+)/g;
  
  const functions = { detect: [], score: [], validate: [], other: [] };
  let match;
  
  while ((match = exportPattern.exec(content)) !== null) {
    const funcName = match[1];
    if (funcName.startsWith('detect')) {
      functions.detect.push(funcName);
    } else if (funcName.startsWith('score')) {
      functions.score.push(funcName);
    } else if (funcName.startsWith('validate')) {
      functions.validate.push(funcName);
    } else {
      functions.other.push(funcName);
    }
  }
  
  return functions;
}

describe('Validator Architecture Consistency', () => {
  
  describe('All projects must have detect* functions', () => {
    test.each(DERIVED_PROJECTS)('%s should export at least one detect* function', (project) => {
      const validatorPath = path.join(GENESIS_TOOLS_DIR, project, 'validator/js/validator.js');
      const functions = getExportedFunctions(validatorPath);
      
      expect(functions.detect.length).toBeGreaterThan(0);
    });
  });

  describe('All projects must have score* functions', () => {
    test.each(DERIVED_PROJECTS)('%s should export at least one score* function', (project) => {
      const validatorPath = path.join(GENESIS_TOOLS_DIR, project, 'validator/js/validator.js');
      const functions = getExportedFunctions(validatorPath);
      
      expect(functions.score.length).toBeGreaterThan(0);
    });
  });

  describe('All projects must have validateDocument function', () => {
    test.each(DERIVED_PROJECTS)('%s should export validateDocument function', (project) => {
      const validatorPath = path.join(GENESIS_TOOLS_DIR, project, 'validator/js/validator.js');
      const functions = getExportedFunctions(validatorPath);
      
      expect(functions.validate).toContain('validateDocument');
    });
  });

  describe('Architecture summary', () => {
    test('should report function counts for all projects', () => {
      console.log('\n📊 Validator Architecture Summary:');
      console.log('─'.repeat(70));
      
      const results = [];
      
      for (const project of DERIVED_PROJECTS) {
        const validatorPath = path.join(GENESIS_TOOLS_DIR, project, 'validator/js/validator.js');
        const functions = getExportedFunctions(validatorPath);
        
        const status = functions.detect.length > 0 ? '✓' : '✗';
        console.log(`${status} ${project.padEnd(35)} detect:${functions.detect.length} score:${functions.score.length} validate:${functions.validate.length}`);
        
        results.push({
          project,
          detectCount: functions.detect.length,
          scoreCount: functions.score.length,
          validateCount: functions.validate.length,
          hasDetect: functions.detect.length > 0
        });
      }
      
      console.log('─'.repeat(70));
      
      const missingDetect = results.filter(r => !r.hasDetect);
      if (missingDetect.length > 0) {
        console.log(`\n❌ ${missingDetect.length} project(s) missing detect* functions:`);
        missingDetect.forEach(r => console.log(`   - ${r.project}`));
      }
      
      // This test always passes - it's just for reporting
      expect(true).toBe(true);
    });
  });
});

