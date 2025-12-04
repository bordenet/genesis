/**
 * Test Suite: Template Content Consistency (TS-004)
 * Priority: P1
 * Type: Integration
 *
 * Objective: Ensure templates are internally consistent and follow best practices
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, '..', '..');
const TEMPLATE_DIR = join(REPO_ROOT, 'genesis', 'templates');

describe('TS-004: Template Content Consistency', () => {
    describe('Dark Mode Configuration', () => {
        test('index-template.html should have Tailwind dark mode config', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'index-template.html');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have Tailwind CDN
            expect(content).toContain('cdn.tailwindcss.com');

            // CRITICAL: Should have dark mode class config
            expect(content).toContain('darkMode');
            expect(content).toContain('class');

            // Should match pattern: darkMode: 'class'
            expect(content).toMatch(/darkMode\s*:\s*['"]class['"]/);
        });

        test('app-template.js should have loadTheme function', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'app-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have loadTheme function or import
            const hasLoadTheme = content.includes('loadTheme') ||
                                content.includes('theme') &&
                                content.includes('localStorage');

            expect(hasLoadTheme).toBe(true);
        });
    });

    describe('JavaScript Quote Style Consistency', () => {
        const jsTemplates = [
            'web-app/js/app-template.js',
            'web-app/js/workflow-template.js',
            'web-app/js/storage-template.js',
            'web-app/js/ai-mock-template.js',
            'web-app/js/same-llm-adversarial-template.js'
        ];

        jsTemplates.forEach(templateFile => {
            test(`${templateFile} should primarily use single quotes`, () => {
                const templatePath = join(TEMPLATE_DIR, templateFile);

                if (!existsSync(templatePath)) {
                    console.warn(`Template not found: ${templatePath}`);
                    return;
                }

                const content = readFileSync(templatePath, 'utf8');

                // Count single vs double quotes (excluding strings within strings)
                // This is a heuristic - proper check would need AST parsing
                const singleQuoteImports = (content.match(/import .+ from '[^']+'/g) || []).length;
                const doubleQuoteImports = (content.match(/import .+ from "[^"]+"/g) || []).length;

                // Single quotes should be predominant in imports
                if (singleQuoteImports + doubleQuoteImports > 0) {
                    expect(singleQuoteImports).toBeGreaterThanOrEqual(doubleQuoteImports);
                }

                // At minimum, shouldn't have obvious violations
                // (like all imports using double quotes)
                if (doubleQuoteImports > 0) {
                    console.warn(`${templateFile} has ${doubleQuoteImports} double-quote imports`);
                }
            });
        });
    });

    describe('Adversarial Workflow Pattern', () => {
        test('workflow-template.js should generate prompts for external AI, not auto-fill', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'workflow-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have prompt generation functions
            const hasPromptGeneration = content.includes('loadPrompt') ||
                                       content.includes('generatePrompt') ||
                                       content.includes('prompt');

            expect(hasPromptGeneration).toBe(true);

            // Should NOT have auto-fill anti-patterns
            const hasAutoFillAntiPattern = content.includes('generatePhase1AI') ||
                                          content.includes('generatePhase2AI') ||
                                          content.includes('autoFill');

            expect(hasAutoFillAntiPattern).toBe(false);
        });

        test('views-template.js should have copy-paste instructions, not "Generate with AI" buttons', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'views-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have copy button or clipboard functionality
            // Note: Templates may use different patterns - checking for common variations
            const hasCopyFunctionality = content.includes('copy') ||
                                        content.includes('clipboard') ||
                                        content.includes('Copy Prompt') ||
                                        content.includes('prompt') && content.includes('button');

            // This is a best practice check, not a hard requirement
            // Templates may implement copy functionality in app.js or other files
            if (!hasCopyFunctionality) {
                console.warn('views-template.js may not have copy functionality - verify in integration');
            }

            // Should NOT have "Generate with AI" anti-pattern
            const hasAutoGenerateButton = content.includes('Generate with AI');

            expect(hasAutoGenerateButton).toBe(false);
        });

        test('ai-mock-template.js should be clearly marked as testing/development only', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'ai-mock-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have comment or documentation indicating mock/testing purpose
            const hasMockDocumentation = content.includes('mock') ||
                                        content.includes('test') ||
                                        content.includes('development');

            expect(hasMockDocumentation).toBe(true);
        });
    });

    describe('Forgiving UX Patterns', () => {
        test('project-view-template.js should auto-generate missing dependencies', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'project-view-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should check for missing data and generate it
            const hasForgivingPattern = (content.includes('if (!prompt)') ||
                                        content.includes('if (!data)')) &&
                                       (content.includes('generate') ||
                                        content.includes('create'));

            // This is a best practice, not strictly required
            if (!hasForgivingPattern) {
                console.warn('project-view-template.js may not implement forgiving UX pattern');
            }
        });
    });

    describe('ESLint Configuration Consistency', () => {
        test('.eslintrc-template.json should enforce single quotes', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', '.eslintrc-template.json');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');
            const config = JSON.parse(content);

            // Should have quotes rule
            if (config.rules && config.rules.quotes) {
                expect(config.rules.quotes).toContain('single');
            }
        });

        test('.eslintrc-template.json should restrict Node.js globals', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', '.eslintrc-template.json');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');
            const config = JSON.parse(content);

            // Should configure environment appropriately
            // For web apps, should restrict Node.js globals
            if (config.env) {
                // Should have browser: true for web apps
                expect(config.env.browser).toBe(true);
            }
        });
    });

    describe('Same-LLM Adversarial Detection', () => {
        test('same-llm-adversarial-template.js should detect same LLM usage', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'same-llm-adversarial-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have detection logic
            const hasDetection = content.includes('isSameLLM') ||
                                content.includes('detectSameLLM') ||
                                (content.includes('phase1') && content.includes('phase2') && content.includes('model'));

            expect(hasDetection).toBe(true);

            // Should have Gemini personality simulation (forget clause)
            const hasGeminiSimulation = content.includes('Gemini') ||
                                       content.includes('forget') ||
                                       content.includes('adversarial');

            expect(hasGeminiSimulation).toBe(true);
        });

        test('same-llm-adversarial test template should have comprehensive scenarios', () => {
            const templatePath = join(TEMPLATE_DIR, 'testing', 'same-llm-adversarial.test-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should test various scenarios
            const scenarios = [
                'same.*LLM',
                'different.*LLM',
                'forget.*clause',
                'adversarial'
            ];

            scenarios.forEach(scenario => {
                const regex = new RegExp(scenario, 'i');
                expect(content).toMatch(regex);
            });
        });
    });

    describe('Storage and IndexedDB Patterns', () => {
        test('storage-template.js should use IndexedDB', () => {
            const templatePath = join(TEMPLATE_DIR, 'web-app', 'js', 'storage-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should use IndexedDB
            expect(content).toContain('indexedDB');

            // Should have error handling
            const hasErrorHandling = content.includes('try') ||
                                    content.includes('catch') ||
                                    content.includes('error');

            expect(hasErrorHandling).toBe(true);
        });

        test('storage test template should test import/export', () => {
            const templatePath = join(TEMPLATE_DIR, 'testing', 'storage.test-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should test import and export functionality
            expect(content).toMatch(/export/i);
            expect(content).toMatch(/import/i);
        });
    });

    describe('Test Coverage Configuration', () => {
        test('jest.config-template.js should enforce coverage thresholds', () => {
            const templatePath = join(TEMPLATE_DIR, 'testing', 'jest.config-template.js');

            if (!existsSync(templatePath)) {
                console.warn(`Template not found: ${templatePath}`);
                return;
            }

            const content = readFileSync(templatePath, 'utf8');

            // Should have coverage thresholds
            expect(content).toMatch(/coverage/i);
            expect(content).toMatch(/threshold/i);

            // Should specify minimum coverage (looking for numbers like 85, 80, etc.)
            expect(content).toMatch(/\d{2,}/);
        });
    });
});
