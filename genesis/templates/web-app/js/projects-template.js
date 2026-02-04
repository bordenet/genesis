/**
 * Project Management Module
 * Handles project CRUD operations and business logic
 * 
 * This module provides:
 * - Project creation with metadata
 * - Multi-project storage and retrieval
 * - Project updates and deletion
 * - Import/export functionality
 */

import storage from './storage.js';

/**
 * Extract title from final document markdown content
 * @param {string} markdown - Document markdown content
 * @returns {string} Extracted title or empty string
 */
function extractTitleFromMarkdown(markdown) {
  if (!markdown) return '';

  // First try: H1 header (# Title)
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
  const title = h1Match[1].trim();
  // Skip generic headers like "PRESS RELEASE" or "Press Release"
  if (!/^press\s+release$/i.test(title)) {
    return title;
  }
  }

  // Second try: Bold headline after "# PRESS RELEASE" or "## Press Release"
  // Pattern: **Headline Text**
  const prMatch = markdown.match(/^#\s*PRESS\s*RELEASE\s*$/im);
  if (prMatch) {
  const startIdx = markdown.indexOf(prMatch[0]) + prMatch[0].length;
  const afterPR = markdown.slice(startIdx).trim();
  const boldMatch = afterPR.match(/^\*\*(.+?)\*\*/);
  if (boldMatch) {
    return boldMatch[1].trim();
  }
  }

  // Third try: First bold line in the document
  const firstBoldMatch = markdown.match(/\*\*(.+?)\*\*/);
  if (firstBoldMatch) {
  const title = firstBoldMatch[1].trim();
  // Only use if it looks like a headline (not too long, not a sentence)
  if (title.length > 10 && title.length < 150 && !title.endsWith('.')) {
    return title;
  }
  }

  return '';
}

/**
 * Create a new project
 * @param {string} title - Project title
 * @param {string} problems - Problems to solve
 * @param {string} context - Additional context
 * @returns {Promise<Object>} Created project object
 */
export async function createProject(title, problems, context) {
  const project = {
    id: crypto.randomUUID(),
    title: title.trim(),
    problems: problems.trim(),
    context: context.trim(),
    phase: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    }
  };

  await storage.saveProject(project);
  return project;
}

/**
 * Get all projects (with migration for old data formats)
 * @returns {Promise<Array>} Array of all projects
 */
export async function getAllProjects() {
  const projects = await storage.getAllProjects();
  return projects.map(migrateProject);
}

/**
 * Get a single project (with migration for old data format)
 * @param {string} id - Project ID
 * @returns {Promise<Object|null>} Project object or null if not found
 */
export async function getProject(id) {
  const project = await storage.getProject(id);
  if (project) {
    return migrateProject(project);
  }
  return null;
}

/**
 * Migrate project from old data formats to current format
 * Ensures backward compatibility with projects created before schema changes
 * @param {Object} project - Project object to migrate
 * @returns {Object} Migrated project object
 */
export function migrateProject(project) {
  if (!project) return project;

  // Ensure phases object exists with all required phases
  if (!project.phases) {
    project.phases = {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    };
  }

  // Ensure each phase has all required properties
  for (let i = 1; i <= 3; i++) {
    if (!project.phases[i]) {
      project.phases[i] = { prompt: '', response: '', completed: false };
    } else {
      // Ensure phase object has all properties
      project.phases[i] = {
        prompt: project.phases[i].prompt || '',
        response: project.phases[i].response || '',
        completed: project.phases[i].completed || false
      };
    }
  }

  // Ensure phase number is set
  if (!project.phase) {
    project.phase = 1;
  }

  return project;
}

/**
 * Update project phase data
 * @param {string} projectId - Project ID
 * @param {number} phase - Phase number (1-3)
 * @param {string} prompt - Generated prompt
 * @param {string} response - AI response
 * @returns {Promise<Object>} Updated project object
 */
export async function updatePhase(projectId, phase, prompt, response) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  project.phases[phase] = {
    prompt: prompt || '',
    response: response || '',
    completed: !!response
  };

  // Auto-advance to next phase if current phase is completed
  if (response && phase < 3) {
    project.phase = phase + 1;
  }

  // Phase 3: Extract title from final document and update project title
  if (phase === 3 && response) {
    const extractedTitle = extractTitleFromMarkdown(response);
    if (extractedTitle) {
      project.title = extractedTitle;
    }
  }

  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Update project metadata
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated project object
 */
export async function updateProject(projectId, updates) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  Object.assign(project, updates);
  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Update project title
 * Used when a better title is extracted from the final AI output
 * @param {string} projectId - Project ID
 * @param {string} newTitle - New title to set
 * @returns {Promise<Object>} Updated project object
 */
export async function updateProjectTitle(projectId, newTitle) {
  return updateProject(projectId, { title: newTitle.trim() });
}

/**
 * Delete a project
 * @param {string} id - Project ID
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await storage.deleteProject(id);
}

/**
 * Export a single project as JSON
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function exportProject(projectId) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all projects as a backup JSON
 * @returns {Promise<void>}
 */
export async function exportAllProjects() {
  const projects = await storage.getAllProjects();
  
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    projects: projects
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `{{PROJECT_NAME}}-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import projects from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<number>} Number of projects imported
 */
export async function importProjects(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result);
        let imported = 0;

        if (content.version && content.projects) {
          // Backup file format
          for (const project of content.projects) {
            await storage.saveProject(project);
            imported++;
          }
        } else if (content.id && content.title) {
          // Single project format
          await storage.saveProject(content);
          imported = 1;
        } else {
          throw new Error('Invalid file format');
        }

        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Sanitize filename for export
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

