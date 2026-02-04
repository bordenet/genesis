/**
 * Canonical Workflow Class Tests for Hello World Template
 *
 * These tests verify the Workflow class contract. This is a 2-phase workflow
 * template, so phase counts differ from 3-phase tools but the pattern is identical.
 *
 * DO NOT MODIFY these tests per-tool. If a test fails, fix the workflow.js
 * implementation to match the contract.
 */

import { jest } from '@jest/globals';
import {
  Workflow,
  WORKFLOW_CONFIG,
  getPhaseMetadata,
  exportFinalDocument,
  getExportFilename,
  createProject,
  generatePrompt,
  validatePhase,
  advancePhase,
  isProjectComplete,
  getCurrentPhase,
  updatePhaseResponse,
  getProgress,
  detectPromptPaste,
  PHASES
} from '../js/workflow.js';

describe('WORKFLOW_CONFIG', () => {
  it('should have required structure', () => {
    expect(WORKFLOW_CONFIG).toBeDefined();
    expect(WORKFLOW_CONFIG.phaseCount).toBe(2);
    expect(WORKFLOW_CONFIG.phases).toBeInstanceOf(Array);
    expect(WORKFLOW_CONFIG.phases.length).toBe(2);
  });

  it('should have required phase properties', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(typeof phase.name).toBe('string');
      expect(typeof phase.description).toBe('string');
      expect(typeof phase.aiModel).toBe('string');
      expect(typeof phase.icon).toBe('string');
    });
  });
});

describe('Workflow class', () => {
  let project;
  let workflow;

  beforeEach(() => {
    project = {
      id: 'test-123',
      title: 'Test Project',
      name: 'Test Project',
      description: 'Test description',
      phase: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    workflow = new Workflow(project);
  });

  describe('constructor', () => {
    it('should initialize with project', () => {
      expect(workflow.project).toBe(project);
      expect(workflow.currentPhase).toBe(1);
    });

    it('should default to phase 1 if not set', () => {
      delete project.phase;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should handle phase 0 as phase 1', () => {
      project.phase = 0;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should handle negative phase as phase 1', () => {
      project.phase = -1;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });
  });

  describe('getCurrentPhase', () => {
    it('should return current phase config', () => {
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(1);
      expect(phase.name).toBeDefined();
    });

    it('should return phase 2 config when on phase 2', () => {
      workflow.currentPhase = 2;
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(2);
    });
  });

  describe('getNextPhase', () => {
    it('should return next phase config', () => {
      const next = workflow.getNextPhase();
      expect(next.number).toBe(2);
    });

    it('should return null on last phase', () => {
      workflow.currentPhase = 2;
      const next = workflow.getNextPhase();
      expect(next).toBeNull();
    });
  });

  describe('isComplete', () => {
    it('should return false when on phase 1', () => {
      expect(workflow.isComplete()).toBe(false);
    });

    it('should return false when on phase 2', () => {
      workflow.currentPhase = 2;
      expect(workflow.isComplete()).toBe(false);
    });

    it('should return true when past phase 2', () => {
      workflow.currentPhase = 3;
      expect(workflow.isComplete()).toBe(true);
    });
  });

  describe('advancePhase', () => {
    it('should advance from phase 1 to phase 2', () => {
      expect(workflow.advancePhase()).toBe(true);
      expect(workflow.currentPhase).toBe(2);
      expect(project.phase).toBe(2);
    });

    it('should advance from phase 2 to phase 3 (complete)', () => {
      workflow.currentPhase = 2;
      project.phase = 2;
      expect(workflow.advancePhase()).toBe(true);
      expect(workflow.currentPhase).toBe(3);
    });

    it('should NOT advance past phase 3', () => {
      workflow.currentPhase = 3;
      project.phase = 3;
      expect(workflow.advancePhase()).toBe(false);
      expect(workflow.currentPhase).toBe(3);
    });
  });

  describe('previousPhase', () => {
    it('should go back from phase 2 to phase 1', () => {
      workflow.currentPhase = 2;
      project.phase = 2;
      expect(workflow.previousPhase()).toBe(true);
      expect(workflow.currentPhase).toBe(1);
    });

    it('should NOT go before phase 1', () => {
      expect(workflow.previousPhase()).toBe(false);
      expect(workflow.currentPhase).toBe(1);
    });
  });

  describe('savePhaseOutput', () => {
    it('should save output for phase 1', () => {
      workflow.savePhaseOutput('Phase 1 content');
      expect(project.phase1_output).toBe('Phase 1 content');
    });

    it('should save output for phase 2', () => {
      workflow.currentPhase = 2;
      workflow.savePhaseOutput('Phase 2 content');
      expect(project.phase2_output).toBe('Phase 2 content');
    });

    it('should update timestamp', () => {
      // Set a clearly different timestamp for comparison
      project.updatedAt = '2020-01-01T00:00:00.000Z';
      workflow.savePhaseOutput('Content');
      expect(project.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
    });
  });

  describe('getPhaseOutput', () => {
    it('should return phase 1 output', () => {
      project.phase1_output = 'Phase 1 content';
      expect(workflow.getPhaseOutput(1)).toBe('Phase 1 content');
    });

    it('should return phase 2 output', () => {
      project.phase2_output = 'Phase 2 content';
      expect(workflow.getPhaseOutput(2)).toBe('Phase 2 content');
    });

    it('should return empty string if no output', () => {
      expect(workflow.getPhaseOutput(1)).toBe('');
    });
  });

  describe('getProgress', () => {
    it('should return 50% for phase 1', () => {
      expect(workflow.getProgress()).toBe(50);
    });

    it('should return 100% for phase 2', () => {
      workflow.currentPhase = 2;
      expect(workflow.getProgress()).toBe(100);
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt for phase 1', async () => {
      const prompt = await workflow.generatePrompt();
      expect(prompt).toContain('Phase 1');
      expect(prompt).toContain('Test Project');
    });

    it('should generate prompt for phase 2', async () => {
      workflow.currentPhase = 2;
      project.phase1_output = 'Phase 1 analysis';
      const prompt = await workflow.generatePrompt();
      expect(prompt).toContain('Phase 2');
      expect(prompt).toContain('Phase 1 analysis');
    });

    it('should throw for invalid phase', async () => {
      workflow.currentPhase = 99;
      await expect(workflow.generatePrompt()).rejects.toThrow('Invalid phase');
    });
  });

  describe('exportAsMarkdown', () => {
    it('should return string', () => {
      const result = workflow.exportAsMarkdown();
      expect(typeof result).toBe('string');
    });

    it('should include phase 2 output when available', () => {
      project.phase2_output = 'Final output content';
      const result = workflow.exportAsMarkdown();
      expect(result).toContain('Final output content');
    });
  });
});

describe('getPhaseMetadata helper', () => {
  it('should return phase 1 metadata', () => {
    const meta = getPhaseMetadata(1);
    expect(meta.number).toBe(1);
    expect(meta.name).toBeDefined();
  });

  it('should return phase 2 metadata', () => {
    const meta = getPhaseMetadata(2);
    expect(meta.number).toBe(2);
    expect(meta.name).toBeDefined();
  });

  it('should return undefined for invalid phase', () => {
    const meta = getPhaseMetadata(99);
    expect(meta).toBeUndefined();
  });
});

describe('exportFinalDocument helper', () => {
  it('should return markdown string', () => {
    const project = { title: 'Test', phase: 1 };
    const result = exportFinalDocument(project);
    expect(typeof result).toBe('string');
  });

  it('should include phase 2 output when available', () => {
    const project = { title: 'Test', phase: 3, phase2_output: 'Final content' };
    const result = exportFinalDocument(project);
    expect(result).toContain('Final content');
  });
});

describe('getExportFilename helper', () => {
  it('should return filename with .md extension', () => {
    const project = { title: 'Test Project' };
    const filename = getExportFilename(project);
    expect(filename).toMatch(/\.md$/);
  });

  it('should sanitize special characters', () => {
    const project = { title: 'Test: Project! @#$%' };
    const filename = getExportFilename(project);
    expect(filename).not.toMatch(/[!@#$%:]/);
  });

  it('should use name if title not available', () => {
    const project = { name: 'Fallback Name' };
    const filename = getExportFilename(project);
    expect(filename).toContain('fallback');
  });
});

// ============================================================================
// LEGACY FUNCTION TESTS - Backward compatibility
// ============================================================================

describe('Legacy Functions', () => {
  describe('createProject', () => {
    it('should create a new project with correct structure', () => {
      const project = createProject('Test Project', 'Test Description');

      expect(project).toBeTruthy();
      expect(project.id).toBeTruthy();
      expect(project.name).toBe('Test Project');
      expect(project.title).toBe('Test Project');
      expect(project.description).toBe('Test Description');
      expect(project.phase).toBe(1);
      expect(project.currentPhase).toBe(1);
    });
  });

  describe('generatePrompt (legacy)', () => {
    it('should generate prompt for phase 1', async () => {
      const project = createProject('Test Project', 'Test Description');
      const prompt = await generatePrompt(project);

      expect(prompt).toContain('Phase 1');
      expect(prompt).toContain('Test Project');
    });

    it('should generate prompt for phase 2 with phase 1 response', async () => {
      const project = createProject('Test Project', 'Test Description');
      project.phase1_output = 'Phase 1 response';
      project.phase = 2;
      project.currentPhase = 2;

      const prompt = await generatePrompt(project);

      expect(prompt).toContain('Phase 2');
      expect(prompt).toContain('Phase 1 response');
    });
  });

  describe('validatePhase', () => {
    it('should fail validation when response is empty', () => {
      const project = createProject('Test', 'Description');
      const result = validatePhase(project);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should pass validation when response is provided', () => {
      const project = createProject('Test', 'Description');
      project.phase1_output = 'Some response';

      const result = validatePhase(project);

      expect(result.valid).toBe(true);
    });
  });

  describe('advancePhase (legacy)', () => {
    it('should advance to next phase', () => {
      const project = createProject('Test', 'Description');
      project.phase1_output = 'Response';

      advancePhase(project);

      expect(project.phase).toBe(2);
      expect(project.currentPhase).toBe(2);
    });
  });

  describe('isProjectComplete (legacy)', () => {
    it('should return false for new project', () => {
      const project = createProject('Test', 'Description');

      expect(isProjectComplete(project)).toBe(false);
    });

    it('should return true when past final phase', () => {
      const project = createProject('Test', 'Description');
      project.phase = 3;
      project.currentPhase = 3;

      expect(isProjectComplete(project)).toBe(true);
    });
  });

  describe('getCurrentPhase (legacy)', () => {
    it('should return current phase object', () => {
      const project = createProject('Test', 'Description');
      const currentPhase = getCurrentPhase(project);

      expect(currentPhase).toBeTruthy();
      expect(currentPhase.number).toBe(1);
    });
  });

  describe('updatePhaseResponse (legacy)', () => {
    it('should update current phase response', () => {
      const project = createProject('Test', 'Description');
      updatePhaseResponse(project, 'New response');

      expect(project.phase1_output).toBe('New response');
    });
  });

  describe('getProgress (legacy)', () => {
    it('should return 50% for phase 1', () => {
      const project = createProject('Test', 'Description');

      expect(getProgress(project)).toBe(50);
    });

    it('should return 100% for phase 2', () => {
      const project = createProject('Test', 'Description');
      project.phase = 2;
      project.currentPhase = 2;

      expect(getProgress(project)).toBe(100);
    });
  });
});

describe('detectPromptPaste', () => {
  describe('should detect Phase N header', () => {
    it('should detect "# Phase 1:" at start of text', () => {
      const result = detectPromptPaste('# Phase 1: Initial Draft\n\nYou are an expert...');
      expect(result.isPrompt).toBe(true);
      expect(result.reason).toContain('prompt');
    });

    it('should detect "# Phase 2:" header', () => {
      const result = detectPromptPaste('# Phase 2: Review\n\nContent...');
      expect(result.isPrompt).toBe(true);
    });

    it('should detect phase header with extra spaces', () => {
      const result = detectPromptPaste('#  Phase  3: Synthesis\n\nContent...');
      expect(result.isPrompt).toBe(true);
    });

    it('should detect phase header case-insensitively', () => {
      const result = detectPromptPaste('# PHASE 1: Something\n\nContent...');
      expect(result.isPrompt).toBe(true);
    });
  });

  describe('should allow valid AI responses', () => {
    it('should allow normal AI response text', () => {
      const result = detectPromptPaste('Here is my analysis of your project. The key points are...');
      expect(result.isPrompt).toBe(false);
      expect(result.reason).toBe('');
    });

    it('should allow markdown responses with non-Phase headers', () => {
      const result = detectPromptPaste('# Project Analysis\n\n## Summary\n\nThis project aims to...');
      expect(result.isPrompt).toBe(false);
    });

    it('should allow responses with code blocks', () => {
      const text = 'Here is the implementation:\n\n```javascript\nconst x = 1;\n```';
      const result = detectPromptPaste(text);
      expect(result.isPrompt).toBe(false);
    });

    it('should allow template variables (no longer flagged)', () => {
      const result = detectPromptPaste('Project: {{PROJECT_NAME}}\nProblem: {{PROBLEM_STATEMENT}}');
      expect(result.isPrompt).toBe(false);
    });

    it('should allow instruction phrases (no longer flagged)', () => {
      const result = detectPromptPaste('You are an expert analyst. Your task is to review the document.');
      expect(result.isPrompt).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null input', () => {
      const result = detectPromptPaste(null);
      expect(result.isPrompt).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = detectPromptPaste(undefined);
      expect(result.isPrompt).toBe(false);
    });

    it('should handle empty string', () => {
      const result = detectPromptPaste('');
      expect(result.isPrompt).toBe(false);
    });

    it('should handle whitespace-only input', () => {
      const result = detectPromptPaste('   \n\n   ');
      expect(result.isPrompt).toBe(false);
    });

    it('should handle number input', () => {
      const result = detectPromptPaste(12345);
      expect(result.isPrompt).toBe(false);
    });
  });
});

describe('validatePhase with prompt detection', () => {
  let project;

  beforeEach(() => {
    project = createProject('Test', 'Description');
  });

  it('should reject prompt paste in phase output', () => {
    project.phase1_output = '# Phase 1: Initial Draft\n\nYou are an expert...';
    const result = validatePhase(project);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('prompt');
  });

  it('should accept valid AI response', () => {
    project.phase1_output = 'Here is my analysis of your project...';
    const result = validatePhase(project);
    expect(result.valid).toBe(true);
  });
});
