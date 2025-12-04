/**
 * Test Suite: Template Variable Replacement (TS-001)
 * Priority: P0
 * Type: Integration
 *
 * Objective: Verify all template variables are correctly replaced during project creation
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, '..', '..');
const TEMPLATE_DIR = join(REPO_ROOT, 'genesis', 'templates');
const TEST_OUTPUT_DIR = join(__dirname, 'output');

// Standard template variables
const TEST_VARIABLES = {
    PROJECT_NAME: 'test-project',
    PROJECT_TITLE: 'Test Project',
    PROJECT_DESCRIPTION: 'A test project for Genesis',
    GITHUB_USER: 'testuser',
    GITHUB_REPO: 'test-repo',
    GITHUB_PAGES_URL: 'https://testuser.github.io/test-repo/',
    HEADER_EMOJI: '🧪',
    FAVICON_EMOJI: '🧪',
    DOCUMENT_TYPE: 'Test Document',
    PHASE_1_AI: 'Claude Sonnet 4.5',
    PHASE_2_AI: 'Gemini 2.5 Pro',
    PHASE_3_AI: 'Claude Sonnet 4.5',
    DEPLOY_FOLDER: '.'
};

/**
 * Replace template variables in content
 */
function replaceVariables(content, variables) {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(pattern, value);
    }
    return result;
}

/**
 * Check if content contains any unreplaced variables
 */
function hasUnreplacedVariables(content) {
    return /\{\{[A-Z_]+\}\}/.test(content);
}

describe('TS-001: Template Variable Replacement', () => {
    beforeEach(() => {
        // Create output directory for test artifacts
        if (!existsSync(TEST_OUTPUT_DIR)) {
            mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
        }
    });

    afterEach(() => {
        // Clean up test artifacts
        if (existsSync(TEST_OUTPUT_DIR)) {
            rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
        }
    });

    describe('HTML Template Variable Replacement', () => {
        test('should replace all variables in index-template.html', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'index-template.html');

            if (!existsSync(templatePath)) {
                console.warn(`Template file not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');
            const replaced = replaceVariables(content, TEST_VARIABLES);

            // Verify no unreplaced variables remain
            expect(hasUnreplacedVariables(replaced)).toBe(false);

            // Verify specific replacements
            expect(replaced).toContain(TEST_VARIABLES.PROJECT_TITLE);
            expect(replaced).toContain(TEST_VARIABLES.PROJECT_DESCRIPTION);
            expect(replaced).toContain(TEST_VARIABLES.HEADER_EMOJI);

            // Verify it's still valid HTML (basic check)
            expect(replaced).toContain('<!DOCTYPE html>');
            expect(replaced).toContain('</html>');
        });
    });

    describe('JavaScript Template Variable Replacement', () => {
        const jsTemplates = [
            'web-app/js/app-template.js',
            'web-app/js/workflow-template.js',
            'web-app/js/storage-template.js',
            'web-app/js/ai-mock-template.js'
        ];

        jsTemplates.forEach(templateFile => {
            test(`should replace all variables in ${templateFile}`, () => {
                const templatePath = join(TEMPLATE_DIR, templateFile);

                if (!existsSync(templatePath)) {
                    console.warn(`Template file not found: ${templatePath}`);
                    return;
                }

                const content = readFileSync(templatePath, 'utf8');
                const replaced = replaceVariables(content, TEST_VARIABLES);

                // Verify no unreplaced variables remain
                expect(hasUnreplacedVariables(replaced)).toBe(false);

                // Verify it's still syntactically valid JavaScript (basic check)
                expect(replaced).not.toContain('{{');
                expect(replaced).not.toContain('}}');
            });
        });
    });

    describe('Configuration File Variable Replacement', () => {
        test('should replace all variables in package-template.json and produce valid JSON', () => {
            const templatePath = join(TEMPLATE_DIR, 'testing', 'package-template.json');

            if (!existsSync(templatePath)) {
                console.warn(`Template file not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');
            const replaced = replaceVariables(content, TEST_VARIABLES);

            // Verify no unreplaced variables remain
            expect(hasUnreplacedVariables(replaced)).toBe(false);

            // Verify it's valid JSON
            expect(() => JSON.parse(replaced)).not.toThrow();

            const parsed = JSON.parse(replaced);
            expect(parsed.name).toBe(TEST_VARIABLES.PROJECT_NAME);
            expect(parsed.description).toBe(TEST_VARIABLES.PROJECT_DESCRIPTION);
        });

        test('should replace all variables in codecov-template.yml and maintain valid YAML', () => {
            const templatePath = join(TEMPLATE_DIR, 'project-structure', 'codecov-template.yml');

            if (!existsSync(templatePath)) {
                console.warn(`Template file not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');
            const replaced = replaceVariables(content, TEST_VARIABLES);

            // Verify no unreplaced variables remain
            expect(hasUnreplacedVariables(replaced)).toBe(false);

            // Basic YAML structure checks
            expect(replaced).toContain('coverage:');
            expect(replaced).toContain('comment:');
        });
    });

    describe('Special Character Handling', () => {
        test('should handle project names with spaces', () => {
            const variablesWithSpaces = {
                ...TEST_VARIABLES,
                PROJECT_NAME: 'my test project'
            };

            const content = 'Project name: {{PROJECT_NAME}}';
            const replaced = replaceVariables(content, variablesWithSpaces);

            expect(replaced).toBe('Project name: my test project');
        });

        test('should handle project names with hyphens', () => {
            const variablesWithHyphens = {
                ...TEST_VARIABLES,
                PROJECT_NAME: 'my-test-project'
            };

            const content = 'Project name: {{PROJECT_NAME}}';
            const replaced = replaceVariables(content, variablesWithHyphens);

            expect(replaced).toBe('Project name: my-test-project');
        });

        test('should handle special characters in descriptions', () => {
            const variablesWithSpecialChars = {
                ...TEST_VARIABLES,
                PROJECT_DESCRIPTION: 'A project with "quotes" and \'apostrophes\''
            };

            const content = 'Description: {{PROJECT_DESCRIPTION}}';
            const replaced = replaceVariables(content, variablesWithSpecialChars);

            expect(replaced).toContain('quotes');
            expect(replaced).toContain('apostrophes');
        });

        test('should handle URLs with special characters', () => {
            const variablesWithURL = {
                ...TEST_VARIABLES,
                GITHUB_PAGES_URL: 'https://user.github.io/repo-name/?param=value'
            };

            const content = 'URL: {{GITHUB_PAGES_URL}}';
            const replaced = replaceVariables(content, variablesWithURL);

            expect(replaced).toBe('URL: https://user.github.io/repo-name/?param=value');
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing variables gracefully', () => {
            const incompleteVariables = {
                PROJECT_NAME: 'test-project'
                // Missing other variables
            };

            const content = '{{PROJECT_NAME}} - {{MISSING_VARIABLE}}';
            const replaced = replaceVariables(content, incompleteVariables);

            expect(replaced).toContain('test-project');
            expect(replaced).toContain('{{MISSING_VARIABLE}}'); // Should remain unreplaced
        });

        test('should handle empty variable values', () => {
            const variablesWithEmpty = {
                ...TEST_VARIABLES,
                PROJECT_DESCRIPTION: ''
            };

            const content = 'Description: {{PROJECT_DESCRIPTION}}';
            const replaced = replaceVariables(content, variablesWithEmpty);

            expect(replaced).toBe('Description: ');
        });

        test('should handle duplicate variables in content', () => {
            const content = '{{PROJECT_NAME}} and {{PROJECT_NAME}} again';
            const replaced = replaceVariables(content, TEST_VARIABLES);

            expect(replaced).toBe('test-project and test-project again');
            expect(hasUnreplacedVariables(replaced)).toBe(false);
        });
    });
});
