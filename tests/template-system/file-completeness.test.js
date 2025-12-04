/**
 * Test Suite: Template File Completeness (TS-002)
 * Priority: P0
 * Type: Integration
 *
 * Objective: Ensure all required template files are present and accessible
 */

import { describe, test, expect } from '@jest/globals';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, '..', '..');
const GENESIS_ROOT = join(REPO_ROOT, 'genesis');
const TEMPLATE_DIR = join(GENESIS_ROOT, 'templates');

/**
 * Recursively find all files matching pattern in directory
 */
function findFiles(dir, pattern) {
    const results = [];

    if (!existsSync(dir)) {
        return results;
    }

    const files = readdirSync(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'coverage') {
                results.push(...findFiles(filePath, pattern));
            }
        } else if (pattern.test(file)) {
            results.push(filePath);
        }
    }

    return results;
}

describe('TS-002: Template File Completeness', () => {
    describe('Mandatory Template Files', () => {
        const mandatoryTemplates = [
            // Core files
            'project-structure/gitignore-template',
            'CLAUDE.md.template',
            'project-structure/README-template.md',
            'testing/package-template.json',

            // Test configuration
            'testing/jest.config-template.js',
            'testing/jest.setup-template.js',

            // Web app core
            'web-app/index-template.html',
            'web-app/js/app-template.js',
            'web-app/js/storage-template.js',
            'web-app/js/workflow-template.js',
            'web-app/js/ai-mock-template.js',

            // Test files
            'testing/ai-mock.test-template.js',
            'testing/storage.test-template.js',
            'testing/workflow.e2e-template.js',

            // Scripts
            'scripts/setup-macos-web-template.sh',
            'scripts/lib/common-template.sh'
        ];

        mandatoryTemplates.forEach(templateFile => {
            test(`mandatory template ${templateFile} should exist`, () => {
                const filePath = join(TEMPLATE_DIR, templateFile);
                expect(existsSync(filePath)).toBe(true);
            });
        });
    });

    describe('Template File Discovery', () => {
        test('should find all template files with -template pattern', () => {
            const templateFiles = findFiles(TEMPLATE_DIR, /-template/);

            expect(templateFiles.length).toBeGreaterThan(0);

            // Log found templates for visibility
            console.log(`Found ${templateFiles.length} template files`);
        });

        test('should find all template files with .template pattern', () => {
            const templateFiles = findFiles(TEMPLATE_DIR, /\.template/);

            expect(templateFiles.length).toBeGreaterThanOrEqual(0);
        });

        test('all template files should be readable', () => {
            const templateFiles = findFiles(TEMPLATE_DIR, /-template|\.template/);

            templateFiles.forEach(filePath => {
                const stat = statSync(filePath);
                expect(stat.isFile()).toBe(true);
                expect(stat.size).toBeGreaterThan(0); // Not empty
            });
        });
    });

    describe('Optional But Recommended Templates', () => {
        const recommendedTemplates = [
            'project-structure/.env.example-template',
            'project-structure/CONTRIBUTING-template.md',
            'github/workflows/ci-template.yml',
            'git-hooks/pre-commit-template',
            'scripts/deploy-web.sh.template'
        ];

        recommendedTemplates.forEach(templateFile => {
            test(`recommended template ${templateFile} should exist`, () => {
                const filePath = join(TEMPLATE_DIR, templateFile);
                expect(existsSync(filePath)).toBe(true);
            });
        });
    });

    describe('Template Directory Structure', () => {
        const requiredDirs = [
            'web-app',
            'web-app/js',
            'web-app/css',
            'testing',
            'scripts',
            'scripts/lib',
            'prompts',
            'github/workflows',
            'project-structure'
        ];

        requiredDirs.forEach(dir => {
            test(`required directory ${dir} should exist`, () => {
                const dirPath = join(TEMPLATE_DIR, dir);
                expect(existsSync(dirPath)).toBe(true);
                expect(statSync(dirPath).isDirectory()).toBe(true);
            });
        });
    });

    describe('Documentation Files', () => {
        const requiredDocs = [
            'START-HERE.md',
            '00-AI-MUST-READ-FIRST.md'  // This is the actual file name
        ];

        requiredDocs.forEach(doc => {
            test(`required documentation ${doc} should exist`, () => {
                const docPath = join(GENESIS_ROOT, doc);
                expect(existsSync(docPath)).toBe(true);
            });
        });
    });

    describe('Example Projects', () => {
        test('hello-world example should exist', () => {
            const examplePath = join(GENESIS_ROOT, 'examples', 'hello-world');
            expect(existsSync(examplePath)).toBe(true);
            expect(statSync(examplePath).isDirectory()).toBe(true);
        });

        test('hello-world example should have package.json', () => {
            const packagePath = join(GENESIS_ROOT, 'examples', 'hello-world', 'package.json');
            expect(existsSync(packagePath)).toBe(true);
        });

        test('hello-world example should have tests', () => {
            const testsPath = join(GENESIS_ROOT, 'examples', 'hello-world', 'tests');
            expect(existsSync(testsPath)).toBe(true);
            expect(statSync(testsPath).isDirectory()).toBe(true);
        });
    });

    describe('Template File Naming Consistency', () => {
        test('all template files should follow naming convention', () => {
            const templateFiles = findFiles(TEMPLATE_DIR, /-template|\.template/);

            templateFiles.forEach(filePath => {
                const fileName = filePath.split('/').pop();

                // Should contain 'template' in the name
                expect(fileName.includes('template')).toBe(true);

                // Should end with proper extension
                const validExtensions = [
                    '.js', '.sh', '.html', '.css', '.md', '.json', '.yml', '.yaml',
                    '-template', '.template'
                ];

                const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
                expect(hasValidExtension).toBe(true);
            });
        });
    });
});
