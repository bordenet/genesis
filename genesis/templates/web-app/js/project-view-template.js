/**
 * Project Detail View Module
 * Handles rendering the project workflow view
 *
 * This module provides the main workflow interface for a single project:
 * - Phase tabs (Phase 1, 2, 3)
 * - Prompt generation and copying
 * - Response input and saving
 * - Phase navigation
 * - Export functionality
 *
 * UX Patterns Implemented:
 * - Auto-advance: Save Response auto-advances to next phase (except final)
 * - Button states: Open AI button disabled until Copy Prompt clicked
 * - Textarea states: Response textarea disabled until Copy Prompt clicked
 * - Shared browser tab: All AI links open in same tab (target="ai-assistant-tab")
 * - Title extraction: Parse # Title from Phase 3 response and update project
 * - Dynamic labels: Show specific AI names (Claude/Gemini) in labels
 * - Step letters: Use Step A/B instead of Step 1/2 to avoid Phase 1/2/3 confusion
 * - Tab underline sync: Update phase tab styles on navigation
 */

import { getProject, updatePhase, updateProjectTitle } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, exportFinalDocument, WORKFLOW_CONFIG } from './workflow.js';
import { escapeHtml, showToast, copyToClipboardAsync, showPromptModal } from './ui.js';
import { navigateTo } from './router.js';
import { preloadPromptTemplates } from './prompts.js';

// Track whether Copy Prompt has been clicked for current phase
let promptCopiedForCurrentPhase = false;

/**
 * Render the project detail view
 * @param {string} projectId - Project ID to render
 */
export async function renderProjectView(projectId) {
  // Preload prompt templates to avoid network delay on first clipboard operation
  // Fire-and-forget: don't await, let it run in parallel with project load
  preloadPromptTemplates().catch(() => {});

  const project = await getProject(projectId);
  
  if (!project) {
    showToast('Project not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
    <div class="mb-6">
      <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Projects
      </button>
      
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ${escapeHtml(project.title)}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            ${escapeHtml(project.problems)}
          </p>
        </div>
        <button id="export-document-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Export {{DOCUMENT_TYPE}}
        </button>
      </div>
    </div>

    <!-- Phase Tabs -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex space-x-1">
        ${[1, 2, 3].map(phase => {
          const meta = getPhaseMetadata(phase);
          const isActive = project.phase === phase;
          const isCompleted = project.phases?.[phase]?.completed || false;
          
          return `
            <button 
              class="phase-tab px-6 py-3 font-medium transition-colors ${
                isActive 
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }"
              data-phase="${phase}"
            >
              <span class="mr-2">${meta.icon}</span>
              Phase ${phase}
              ${isCompleted ? '<span class="ml-2 text-green-500">✓</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Phase Content -->
    <div id="phase-content">
      ${renderPhaseContent(project, project.phase)}
    </div>
  `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));
  document.getElementById('export-document-btn').addEventListener('click', () => {
    const markdown = exportFinalDocument(project);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Document exported successfully', 'success');
  });
  
  // Phase tabs - re-fetch project to ensure fresh data
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const targetPhase = parseInt(tab.dataset.phase);

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);

      // Guard: Can only navigate to a phase if all prior phases are complete
      // Phase 1 is always accessible
      if (targetPhase > 1) {
        const priorPhase = targetPhase - 1;
        const priorPhaseComplete = freshProject.phases?.[priorPhase]?.completed;
        if (!priorPhaseComplete) {
          showToast(`Complete Phase ${priorPhase} before proceeding to Phase ${targetPhase}`, 'warning');
          return;
        }
      }

      freshProject.phase = targetPhase;
      promptCopiedForCurrentPhase = false; // Reset for new phase
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, targetPhase);
      updatePhaseTabStyles(targetPhase);
      attachPhaseEventListeners(freshProject, targetPhase);
    });
  });

  attachPhaseEventListeners(project, project.phase);
}

/**
 * Update phase tab underline styles
 * Called when navigating between phases to keep tab styling in sync
 * @param {number} activePhase - The currently active phase number
 */
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const phase = parseInt(tab.dataset.phase);
    if (phase === activePhase) {
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.remove('text-gray-600', 'dark:text-gray-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400');
    }
  });
}

/**
 * Render content for a specific phase
 * @param {Object} project - Project object
 * @param {number} phase - Phase number (1-3)
 * @returns {string} HTML content for the phase
 */
function renderPhaseContent(project, phase) {
  const meta = getPhaseMetadata(phase);
  const phaseData = project.phases?.[phase] || { prompt: '', response: '', completed: false };
  const phaseCount = WORKFLOW_CONFIG.phaseCount;
  const isFinalPhase = phase === phaseCount;

  // Determine if textarea should be enabled:
  // - If response already exists (user returning to completed phase), enable it
  // - If prompt was just copied (promptCopiedForCurrentPhase), enable it
  // - Otherwise, disable it until Copy Prompt is clicked
  const hasExistingResponse = phaseData.response && phaseData.response.trim().length > 0;
  const textareaEnabled = hasExistingResponse || promptCopiedForCurrentPhase;

  // Determine if Open AI button should be enabled (only after Copy Prompt clicked)
  const openAiEnabled = promptCopiedForCurrentPhase || phaseData.prompt;

  // Get the AI URL based on the AI model name
  const aiUrl = getAiUrl(meta.ai || meta.aiModel);

  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ${meta.icon} ${meta.title || meta.name}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          ${meta.description}
        </p>
        <div class="inline-flex items-center px-3 py-1 bg-${meta.color || 'blue'}-100 dark:bg-${meta.color || 'blue'}-900/20 text-${meta.color || 'blue'}-800 dark:text-${meta.color || 'blue'}-300 rounded-full text-sm">
          <span class="mr-2">🤖</span>
          Use with ${meta.ai || meta.aiModel}
        </div>
      </div>

      <!-- Step A: Copy Prompt -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step A: Copy Prompt to ${meta.ai || meta.aiModel}
        </h4>
        <div class="flex flex-wrap gap-3">
          <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📋 ${phaseData.prompt ? 'Copy Prompt Again' : 'Generate & Copy Prompt'}
          </button>
          <a
            id="open-ai-btn"
            href="${aiUrl}"
            target="ai-assistant-tab"
            rel="noopener"
            class="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center ${
              openAiEnabled
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none dark:bg-gray-600 dark:text-gray-400'
            }"
            ${openAiEnabled ? '' : 'aria-disabled="true"'}
          >
            🚀 Open ${meta.ai || meta.aiModel}
          </a>
        </div>
        <button id="view-prompt-btn" class="px-4 py-3 text-blue-600 dark:text-blue-400 hover:underline font-medium ${phaseData.prompt ? '' : 'hidden'}">
          👁️ View Prompt
        </button>
      </div>

      <!-- Step B: Paste Response -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step B: Paste ${meta.ai || meta.aiModel}'s Response
        </h4>
        <textarea
          id="response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm ${
            textareaEnabled ? '' : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
          }"
          placeholder="${textareaEnabled ? `Paste ${meta.ai || meta.aiModel}'s response here...` : 'Copy the prompt first, then paste the AI response here...'}"
          ${textareaEnabled ? '' : 'disabled'}
        >${escapeHtml(phaseData.response || '')}</textarea>

        <div class="mt-3 flex justify-between items-center">
          ${phaseData.completed && !isFinalPhase ? `
            <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Next Phase →
            </button>
          ` : `
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Paste response to complete this phase
            </span>
          `}
          <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Save Response
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get the URL for the specified AI assistant
 * @param {string} aiName - Name of the AI (e.g., "Claude", "Gemini", "GPT-4")
 * @returns {string} URL to open the AI assistant
 */
function getAiUrl(aiName) {
  const aiNameLower = (aiName || '').toLowerCase();
  if (aiNameLower.includes('claude')) {
    return 'https://claude.ai/new';
  } else if (aiNameLower.includes('gemini')) {
    return 'https://gemini.google.com/app';
  } else if (aiNameLower.includes('gpt') || aiNameLower.includes('chatgpt')) {
    return 'https://chat.openai.com';
  } else {
    // Default to Claude
    return 'https://claude.ai/new';
  }
}

/**
 * Attach event listeners for phase interactions
 * @param {Object} project - Project object
 * @param {number} phase - Phase number (1-3)
 */
function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const prevPhaseBtn = document.getElementById('prev-phase-btn');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const openAiBtn = document.getElementById('open-ai-btn');
  const viewPromptBtn = document.getElementById('view-prompt-btn');
  const phaseCount = WORKFLOW_CONFIG.phaseCount;
  const isFinalPhase = phase === phaseCount;
  const meta = getPhaseMetadata(phase);

  copyPromptBtn.addEventListener('click', () => {
    // CRITICAL: Safari transient activation fix
    // We must call copyToClipboardAsync SYNCHRONOUSLY within the click handler
    // Pass a Promise that resolves to the prompt text - the clipboard write happens
    // immediately, preserving Safari's transient activation window
    let generatedPrompt = null;
    const promptPromise = (async () => {
      const prompt = await generatePromptForPhase(project, phase);
      await updatePhase(project.id, phase, prompt, project.phases?.[phase]?.response || '');
      generatedPrompt = prompt; // Store for use in .then()
      return prompt;
    })();

    // Call clipboard API synchronously with Promise - preserves transient activation
    copyToClipboardAsync(promptPromise)
      .then(() => {
        // Mark that prompt has been copied for this phase
        promptCopiedForCurrentPhase = true;

        // Update button text to indicate prompt can be copied again
        copyPromptBtn.innerHTML = '📋 Copy Prompt Again';

        // Show the View Prompt button
        if (viewPromptBtn) {
          viewPromptBtn.classList.remove('hidden', 'opacity-50', 'cursor-not-allowed');
          viewPromptBtn.disabled = false;
          // Store prompt for viewing
          viewPromptBtn.dataset.prompt = generatedPrompt;
        }

        // Enable the response textarea
        if (responseTextarea) {
          responseTextarea.disabled = false;
          responseTextarea.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'cursor-not-allowed');
          responseTextarea.placeholder = `Paste ${meta.ai || meta.aiModel}'s response here...`;
          responseTextarea.focus(); // Auto-focus for easy paste
        }

        // Enable the Open AI button
        if (openAiBtn) {
          openAiBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'pointer-events-none', 'dark:bg-gray-600', 'dark:text-gray-400');
          openAiBtn.classList.add('bg-purple-600', 'text-white', 'hover:bg-purple-700');
          openAiBtn.removeAttribute('aria-disabled');
        }

        showToast('Prompt copied to clipboard!', 'success');
      })
      .catch((error) => {
        console.error('Error generating prompt:', error);
        showToast('Failed to generate prompt', 'error');
      });
  });

  saveResponseBtn.addEventListener('click', async () => {
    const response = responseTextarea.value.trim();
    if (response) {
      await updatePhase(project.id, phase, project.phases?.[phase]?.prompt || '', response);

      // Extract title from final phase response if applicable
      if (isFinalPhase) {
        const extractedTitle = extractTitleFromMarkdown(response);
        if (extractedTitle && extractedTitle !== project.title) {
          await updateProjectTitle(project.id, extractedTitle);
          showToast(`Title updated to: "${extractedTitle}"`, 'info');
        }
      }

      showToast('Response saved successfully!', 'success');

      // Auto-advance to next phase (except on final phase)
      if (!isFinalPhase) {
        promptCopiedForCurrentPhase = false; // Reset for new phase
        project.phase = phase + 1;
        document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase + 1);
        updatePhaseTabStyles(phase + 1);
        attachPhaseEventListeners(project, phase + 1);
      } else {
        renderProjectView(project.id);
      }
    } else {
      showToast('Please enter a response', 'warning');
    }
  });

  // Wire up "View Prompt" button
  if (viewPromptBtn) {
    viewPromptBtn.addEventListener('click', () => {
      // Use stored prompt from dataset or from project phases
      const prompt = viewPromptBtn.dataset.prompt || project.phases?.[phase]?.prompt || '';
      if (prompt) {
        const phaseName = meta.title || meta.name || `Phase ${phase}`;
        showPromptModal(prompt, phaseName);
      }
    });
  }

  // Previous phase button - re-fetch project to ensure fresh data
  if (prevPhaseBtn) {
    prevPhaseBtn.addEventListener('click', async () => {
      const prevPhase = phase - 1;
      if (prevPhase < 1) return;

      promptCopiedForCurrentPhase = false; // Reset for new phase

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = prevPhase;

      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, prevPhase);
      updatePhaseTabStyles(prevPhase);
      attachPhaseEventListeners(freshProject, prevPhase);
    });
  }

  // Next phase button - re-fetch project to ensure fresh data
  if (nextPhaseBtn && project.phases?.[phase]?.completed) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;

      promptCopiedForCurrentPhase = false; // Reset for new phase

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
      updatePhaseTabStyles(nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }
}

/**
 * Extract the title from a markdown document
 * Looks for # Title pattern at the start of the document
 * @param {string} markdown - Markdown content
 * @returns {string|null} Extracted title or null if not found
 */
function extractTitleFromMarkdown(markdown) {
  if (!markdown) return null;

  // Look for # Title at the beginning of the document
  const lines = markdown.trim().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Match # followed by title text (not ## or more)
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      const title = trimmed.substring(2).trim();
      // Return if it's a reasonable title (not empty, not too long)
      if (title && title.length > 0 && title.length < 200) {
        return title;
      }
    }
    // Skip empty lines at the start
    if (trimmed.length > 0 && !trimmed.startsWith('#')) {
      // Non-heading content found before title, stop looking
      break;
    }
  }

  return null;
}

