/**
 * Workflow Module Tests
 * Tests for the 3-phase workflow management
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { Workflow, WORKFLOW_CONFIG, getPhaseMetadata, exportFinalDocument, getExportFilename } from '../js/workflow.js';

describe('Workflow Module', () => {
  describe('WORKFLOW_CONFIG', () => {
    test('should have required structure', () => {
      expect(WORKFLOW_CONFIG).toBeDefined();
      expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
      expect(WORKFLOW_CONFIG.phases).toBeInstanceOf(Array);
      expect(WORKFLOW_CONFIG.phases.length).toBe(3);
    });

    test('should have required phase properties', () => {
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
        description: 'Test description',
        context: 'Test context',
        phase: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      workflow = new Workflow(project);
    });

    test('should initialize with project', () => {
      expect(workflow.project).toBe(project);
      expect(workflow.currentPhase).toBe(1);
    });

    test('should get current phase', () => {
      const phase = workflow.getCurrentPhase();
      expect(phase).toBeDefined();
      expect(phase.number).toBe(1);
      expect(phase.name).toBe('Draft');
    });

    test('should get next phase', () => {
      const nextPhase = workflow.getNextPhase();
      expect(nextPhase).toBeDefined();
      expect(nextPhase.number).toBe(2);
    });

    test('should return null for next phase when at last phase', () => {
      workflow.currentPhase = 3;
      const nextPhase = workflow.getNextPhase();
      expect(nextPhase).toBeNull();
    });

    test('should advance phase', () => {
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(2);
    });

    test('should not advance past completion', () => {
      workflow.currentPhase = 4;
      const result = workflow.advancePhase();
      expect(result).toBe(false);
    });

    test('should go to previous phase', () => {
      workflow.currentPhase = 2;
      const result = workflow.previousPhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(1);
    });

    test('should not go before phase 1', () => {
      const result = workflow.previousPhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(1);
    });

    test('should check if workflow is complete', () => {
      expect(workflow.isComplete()).toBe(false);
      workflow.currentPhase = 4;
      expect(workflow.isComplete()).toBe(true);
    });

    test('should save and get phase output', () => {
      workflow.savePhaseOutput('Test output');
      expect(project.phase1_output).toBe('Test output');
      expect(workflow.getPhaseOutput(1)).toBe('Test output');
    });
  });

  describe('getPhaseMetadata', () => {
    test('should return metadata for valid phase', () => {
      const metadata = getPhaseMetadata(1);
      expect(metadata).toBeDefined();
      expect(metadata.number).toBe(1);
      expect(metadata.name).toBe('Draft');
    });

    test('should return undefined for invalid phase', () => {
      const metadata = getPhaseMetadata(99);
      expect(metadata).toBeUndefined();
    });
  });

  describe('exportFinalDocument', () => {
    test('should export project as markdown', () => {
      const project = {
        id: 'test-123',
        title: 'Test Project',
        description: 'Test description',
        phase1_output: 'Draft content',
        phase2_output: 'Review feedback',
        phase3_output: 'Final content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const markdown = exportFinalDocument(project);
      expect(markdown).toContain('# Test Project');
      expect(markdown).toContain('Final content');
    });
  });

  describe('getExportFilename', () => {
    test('should generate filename from project title', () => {
      const project = { title: 'My Test Project' };
      const filename = getExportFilename(project);
      expect(filename).toBe('my-test-project.md');
    });

    test('should handle special characters in title', () => {
      const project = { title: 'Project: Test & Demo!' };
      const filename = getExportFilename(project);
      expect(filename).toMatch(/\.md$/);
    });
  });
});
