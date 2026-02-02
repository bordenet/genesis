/**
 * Workflow Module
 * Manages the {{PHASE_COUNT}}-phase workflow for {{PROJECT_TITLE}}
 * @module workflow
 */

import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt as genPhase1,
  generatePhase2Prompt as genPhase2,
  generatePhase3Prompt as genPhase3
} from './prompts.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

export class Workflow {
    constructor(project) {
        this.project = project;
        this.currentPhase = project.phase || 1;
    }

    /**
     * Get current phase configuration
     */
    getCurrentPhase() {
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
        // Allow advancing up to phase 4 (complete state)
        if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
            this.currentPhase++;
            this.project.phase = this.currentPhase;
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
            return true;
        }
        return false;
    }

    /**
     * Generate prompt for current phase
     * Uses prompts.js module for template loading and variable replacement
     */
    async generatePrompt() {
      const p = this.project;
      const formData = {
        title: p.title || '',
        description: p.description || '',
        context: p.context || ''
        // Add additional form fields as needed
      };

      switch (this.currentPhase) {
      case 1:
        return await genPhase1(formData);
      case 2:
        return await genPhase2(p.phase1_output || '[Phase 1 output not yet generated]');
      case 3:
        return await genPhase3(
          p.phase1_output || '[Phase 1 output not yet generated]',
          p.phase2_output || '[Phase 2 output not yet generated]'
        );
      default:
        throw new Error(`Invalid phase: ${this.currentPhase}`);
      }
    }

    /**
     * Replace variables in prompt template - legacy method kept for backward compatibility
     */
    replaceVariables(template) {
        let result = template;

        // Replace project-specific variables using {{VAR}} syntax
        result = result.replace(/\{\{TITLE\}\}/g, this.project.title || '');
        result = result.replace(/\{\{DESCRIPTION\}\}/g, this.project.description || '');
        result = result.replace(/\{\{CONTEXT\}\}/g, this.project.context || '');

        // Replace phase outputs
        for (let i = 1; i < this.currentPhase; i++) {
            const phaseKey = `phase${i}_output`;
            const phaseOutput = this.project[phaseKey] || '';
            result = result.replace(new RegExp(`\\{${phaseKey}\\}`, 'g'), phaseOutput);
        }

        return result;
    }

    /**
     * Save phase output
     */
    savePhaseOutput(output) {
        const phaseKey = `phase${this.currentPhase}_output`;
        this.project[phaseKey] = output;
        this.project.updatedAt = new Date().toISOString();
    }

    /**
     * Get phase output
     */
    getPhaseOutput(phaseNumber) {
        const phaseKey = `phase${phaseNumber}_output`;
        return this.project[phaseKey] || '';
    }

    /**
     * Export final output as Markdown
     */
    exportAsMarkdown() {
        let markdown = `# ${this.project.title}\n\n`;
        markdown += `**Created**: ${new Date(this.project.createdAt).toLocaleDateString()}\n`;
        markdown += `**Last Updated**: ${new Date(this.project.updatedAt).toLocaleDateString()}\n\n`;
        
        if (this.project.description) {
            markdown += `## Description\n\n${this.project.description}\n\n`;
        }

        // Add each phase output
        for (let i = 1; i <= WORKFLOW_CONFIG.phaseCount; i++) {
            const phase = WORKFLOW_CONFIG.phases.find(p => p.number === i);
            const output = this.getPhaseOutput(i);
            
            if (output) {
                markdown += `## Phase ${i}: ${phase.name}\n\n`;
                markdown += `${output}\n\n`;
                markdown += `---\n\n`;
            }
        }

        return markdown;
    }

    /**
     * Get workflow progress percentage
     */
    getProgress() {
        return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
    }
}

/**
 * Standalone helper functions for use in views
 * These provide a simpler API for common workflow operations
 */

/**
 * Get metadata for a specific phase
 * @param {number} phaseNumber - Phase number (1, 2, 3, etc.)
 * @returns {Object} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
    return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Generate prompt for a specific phase
 * @param {Object} project - Project object
 * @param {number} phaseNumber - Phase number
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePromptForPhase(project, phaseNumber) {
    const workflow = new Workflow(project);
    workflow.currentPhase = phaseNumber;
    return await workflow.generatePrompt();
}

/**
 * Export final document as Markdown
 * @param {Object} project - Project object
 * @returns {string} Markdown content
 */
export function exportFinalDocument(project) {
    const workflow = new Workflow(project);
    return workflow.exportAsMarkdown();
}

/**
 * Get the final markdown content for a completed project
 * Returns the last phase output or full export if all phases complete
 * @param {Object} project - Project object
 * @returns {string|null} Markdown content or null if not available
 */
export function getFinalMarkdown(project) {
    if (!project) return null;

    // Check if phase 3 is complete and has output
    if (project.phases && project.phases[3] && project.phases[3].completed) {
        // Return the final phase output (usually the refined document)
        const finalOutput = project.phases[3].aiResponse || project.phase3_output;
        if (finalOutput) {
            return finalOutput;
        }
    }

    // Fallback to full export
    return exportFinalDocument(project);
}

/**
 * Generate export filename for a project
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
    const title = project.title || project.name || 'document';
    // Sanitize filename: remove special chars, replace spaces with hyphens
    const sanitized = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    return `${sanitized}.md`;
}
