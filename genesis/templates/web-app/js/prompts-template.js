/**
 * {{PROJECT_TITLE}} Prompts Module
 * @module prompts
 *
 * Manages workflow configuration and prompt generation.
 * Prompts are stored in prompts/ directory as markdown files.
 *
 * Template Variable Syntax: {{VAR_NAME}} (double braces, SCREAMING_SNAKE_CASE)
 */

export const WORKFLOW_CONFIG = {
  phaseCount: {{PHASE_COUNT}},
  phases: [
    {{#each PHASES}}
    {
      number: {{number}},
      name: '{{name}}',
      icon: '{{icon}}',
      aiModel: '{{ai_model}}',
      description: '{{description}}'
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
};

// Cache for loaded prompt templates
const promptCache = {};

/**
 * Load prompt template from markdown file
 * @param {number} phaseNumber - Phase number (1, 2, or 3)
 * @returns {Promise<string>} Prompt template
 */
async function loadPromptTemplate(phaseNumber) {
  if (promptCache[phaseNumber]) {
    return promptCache[phaseNumber];
  }

  try {
    const response = await fetch(`prompts/phase${phaseNumber}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt template for phase ${phaseNumber}`);
    }
    const template = await response.text();
    promptCache[phaseNumber] = template;
    return template;
  } catch (error) {
    console.error(`Error loading prompt template for phase ${phaseNumber}:`, error);
    throw error;
  }
}

/**
 * Preload all prompt templates to avoid network delay on first click.
 * This ensures clipboard operations happen within Safari's transient activation window.
 * Call this when the app initializes or when entering a project view.
 * @returns {Promise<void>}
 */
export async function preloadPromptTemplates() {
  const phases = Array.from({ length: WORKFLOW_CONFIG.phaseCount }, (_, i) => i + 1);
  await Promise.all(phases.map(phase => loadPromptTemplate(phase)));
}

/**
 * Replace template variables with actual values
 * Uses {{VAR_NAME}} syntax (double braces, SCREAMING_SNAKE_CASE)
 * @param {string} template - Template string
 * @param {Object} vars - Variables to replace
 * @returns {string} Processed template
 */
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

/**
 * Phase 1 Prompt: Initial Draft Generation
 * @param {Object} formData - Form data from project
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase1Prompt(formData) {
  const template = await loadPromptTemplate(1);
  return replaceTemplateVars(template, {
    // Add your Phase 1 variables here
    // Example:
    // TITLE: formData.title || '',
    // CONTEXT: formData.context || ''
  });
}

/**
 * Phase 2 Prompt: Review/Critique
 * @param {string} phase1Output - Output from phase 1
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase2Prompt(phase1Output) {
  const template = await loadPromptTemplate(2);
  return replaceTemplateVars(template, {
    PHASE1_OUTPUT: phase1Output
  });
}

/**
 * Phase 3 Prompt: Final Synthesis
 * @param {string} phase1Output - Output from phase 1
 * @param {string} phase2Output - Output from phase 2
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase3Prompt(phase1Output, phase2Output) {
  const template = await loadPromptTemplate(3);
  return replaceTemplateVars(template, {
    PHASE1_OUTPUT: phase1Output,
    PHASE2_OUTPUT: phase2Output
  });
}

/**
 * Get phase metadata
 * @param {number} phaseNumber - Phase number
 * @returns {Object|undefined} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

