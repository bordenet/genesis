/**
 * Workflow Module - 2-phase workflow engine
 * @module workflow
 *
 * This is the canonical hello-world template that all new genesis projects
 * are derived from. It demonstrates the standard Workflow class pattern.
 */

import { generateId } from './storage.js';

// ============================================================================
// WORKFLOW_CONFIG - Canonical configuration structure
// ============================================================================

export const WORKFLOW_CONFIG = {
  phaseCount: 2,
  phases: [
    {
      number: 1,
      name: 'Input',
      description: 'Provide input for analysis',
      aiModel: 'Claude Sonnet 4.5',
      icon: '📝'
    },
    {
      number: 2,
      name: 'Output',
      description: 'Generate final output based on analysis',
      aiModel: 'Gemini 2.5 Pro',
      icon: '✨'
    }
  ]
};

// Legacy alias for backward compatibility
export const PHASES = WORKFLOW_CONFIG.phases;

// ============================================================================
// WORKFLOW CLASS - Canonical implementation
// ============================================================================

export class Workflow {
  constructor(project) {
    this.project = project;
    // Clamp phase to valid range (1 minimum)
    const rawPhase = project.phase || project.currentPhase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
   * Get current phase configuration
   */
  getCurrentPhase() {
    if (this.currentPhase > WORKFLOW_CONFIG.phaseCount) {
      return WORKFLOW_CONFIG.phases[WORKFLOW_CONFIG.phaseCount - 1];
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
   * Get next phase configuration
   */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
  }

  /**
   * Check if workflow is complete
   */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
   * Advance to next phase
   */
  advancePhase() {
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      this.project.currentPhase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Go back to previous phase
   */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      this.project.currentPhase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Generate prompt for current phase
   */
  async generatePrompt() {
    switch (this.currentPhase) {
    case 1:
      return `# Phase 1: Input

Project: ${this.project.name || this.project.title}
Description: ${this.project.description}

Please analyze the following input and provide your insights:

[User will paste their input here]

Provide a detailed analysis.`;
    case 2:
      return `# Phase 2: Output

Project: ${this.project.name || this.project.title}

Based on the Phase 1 analysis:
${this.getPhaseOutput(1) || '[No Phase 1 output]'}

Please provide the final output.`;
    default:
      throw new Error(`Invalid phase: ${this.currentPhase}`);
    }
  }

  /**
   * Save phase output
   */
  savePhaseOutput(output) {
    const phaseKey = `phase${this.currentPhase}_output`;
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
    this.project.modified = Date.now();
  }

  /**
   * Get phase output
   */
  getPhaseOutput(phaseNumber) {
    // Flat format (canonical) - check first
    const flatKey = `phase${phaseNumber}_output`;
    if (this.project[flatKey]) {
      return this.project[flatKey];
    }
    // Nested format (legacy) - fallback
    if (this.project.phases) {
      if (Array.isArray(this.project.phases) && this.project.phases[phaseNumber - 1]) {
        return this.project.phases[phaseNumber - 1].response || '';
      }
    }
    return '';
  }

  /**
   * Export final output as Markdown
   */
  exportAsMarkdown() {
    const attribution = '\n\n---\n\n*Generated with Hello World Template*';
    const finalOutput = this.getPhaseOutput(WORKFLOW_CONFIG.phaseCount);

    if (finalOutput) {
      return finalOutput + attribution;
    }

    // Fallback: export phase 1 output if final phase not complete
    const phase1Output = this.getPhaseOutput(1);
    if (phase1Output) {
      return phase1Output + attribution;
    }

    return `# ${this.project.name || this.project.title}\n\nNo content generated yet.`;
  }

  /**
   * Get workflow progress percentage
   */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }
}

// ============================================================================
// HELPER FUNCTIONS - Canonical exports
// ============================================================================

/**
 * Get phase metadata from WORKFLOW_CONFIG
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Export final document as markdown (returns the markdown string)
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
}

/**
 * Generate export filename for a project
 */
export function getExportFilename(project) {
  const title = project.title || project.name || 'hello-world';
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${sanitized}.md`;
}

// ============================================================================
// LEGACY FUNCTIONS - For backward compatibility
// ============================================================================

/**
 * Create new project
 */
export function createProject(name, description) {
  return {
    id: generateId(),
    name: name,
    title: name,
    description: description,
    created: Date.now(),
    modified: Date.now(),
    phase: 1,
    currentPhase: 1
  };
}

/**
 * Generate prompt for current phase (legacy wrapper)
 */
export async function generatePrompt(project) {
  const workflow = new Workflow(project);
  return await workflow.generatePrompt();
}

/**
 * Validate phase completion
 */
export function validatePhase(project) {
  const workflow = new Workflow(project);
  const output = workflow.getPhaseOutput(workflow.currentPhase);

  if (!output || output.trim() === '') {
    return { valid: false, error: 'Please paste the AI response' };
  }

  return { valid: true };
}

/**
 * Complete current phase and advance (legacy wrapper)
 */
export function advancePhase(project) {
  const workflow = new Workflow(project);
  workflow.advancePhase();
  return project;
}

/**
 * Check if project is complete (legacy wrapper)
 */
export function isProjectComplete(project) {
  const workflow = new Workflow(project);
  return workflow.isComplete();
}

/**
 * Get current phase (legacy wrapper)
 */
export function getCurrentPhase(project) {
  const workflow = new Workflow(project);
  return workflow.getCurrentPhase();
}

/**
 * Update phase response (legacy wrapper)
 */
export function updatePhaseResponse(project, response) {
  const workflow = new Workflow(project);
  workflow.savePhaseOutput(response);
  return project;
}

/**
 * Get project progress percentage (legacy wrapper)
 */
export function getProgress(project) {
  const workflow = new Workflow(project);
  return workflow.getProgress();
}

