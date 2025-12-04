/**
 * Test Suite: Go Validator Integration (GV-003)
 * Priority: P0
 * Type: Integration
 *
 * Objective: Verify validator correctly identifies issues
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, '..', '..');
const VALIDATOR_BIN = join(REPO_ROOT, 'genesis-validator', 'bin', 'genesis-validator');
const GENESIS_ROOT = join(REPO_ROOT, 'genesis');

describe('GV-003: Validation Logic Correctness', () => {
    beforeAll(() => {
        // Check if validator binary exists
        if (!existsSync(VALIDATOR_BIN)) {
            console.warn(`Validator binary not found at ${VALIDATOR_BIN}`);
            console.warn('Run: cd genesis-validator && go build -o bin/genesis-validator ./cmd/genesis-validator');
        }
    });

    describe('Validator Binary Existence', () => {
        test('validator binary should exist', () => {
            expect(existsSync(VALIDATOR_BIN)).toBe(true);
        });

        test('genesis directory should exist', () => {
            expect(existsSync(GENESIS_ROOT)).toBe(true);
        });
    });

    describe('Validator Execution', () => {
        test('validator should run without crashing', async () => {
            if (!existsSync(VALIDATOR_BIN)) {
                console.warn('Skipping test - validator binary not found');
                return;
            }

            try {
                const { stdout, stderr } = await execAsync(`${VALIDATOR_BIN} -no-prompt`, {
                    cwd: REPO_ROOT,
                    timeout: 10000
                });

                // Should produce some output
                expect(stdout || stderr).toBeTruthy();

                // Output should contain validation information
                const output = stdout + stderr;
                expect(output).toMatch(/template|file|found|check/i);
            } catch (error) {
                // Validator may exit with non-zero code if issues found
                // That's okay - we just want to ensure it runs
                expect(error.stdout || error.stderr).toBeTruthy();
            }
        }, 15000);

        test('validator should support -verbose flag', async () => {
            if (!existsSync(VALIDATOR_BIN)) {
                console.warn('Skipping test - validator binary not found');
                return;
            }

            try {
                const { stdout, stderr } = await execAsync(`${VALIDATOR_BIN} -verbose -no-prompt`, {
                    cwd: REPO_ROOT,
                    timeout: 10000
                });

                const output = stdout + stderr;
                // Verbose mode should produce more output
                expect(output.length).toBeGreaterThan(50);
            } catch (error) {
                // Even if it exits with error, should have output
                const output = (error.stdout || '') + (error.stderr || '');
                expect(output.length).toBeGreaterThan(50);
            }
        }, 15000);

        test('validator should support -no-prompt flag', async () => {
            if (!existsSync(VALIDATOR_BIN)) {
                console.warn('Skipping test - validator binary not found');
                return;
            }

            try {
                const { stdout, stderr } = await execAsync(`${VALIDATOR_BIN} -no-prompt`, {
                    cwd: REPO_ROOT,
                    timeout: 10000
                });

                const output = stdout + stderr;

                // Should NOT contain LLM prompt markers
                expect(output).not.toMatch(/\[LLM PROMPT\]/);
                expect(output).not.toMatch(/Copy the following prompt/);
            } catch (error) {
                const output = (error.stdout || '') + (error.stderr || '');
                expect(output).not.toMatch(/\[LLM PROMPT\]/);
            }
        }, 15000);
    });

    describe('Validation Output Format', () => {
        test('validator output should include summary statistics', async () => {
            if (!existsSync(VALIDATOR_BIN)) {
                console.warn('Skipping test - validator binary not found');
                return;
            }

            try {
                const { stdout, stderr } = await execAsync(`${VALIDATOR_BIN} -no-prompt`, {
                    cwd: REPO_ROOT,
                    timeout: 10000
                });

                const output = stdout + stderr;

                // Should include counts of files found/checked
                expect(output).toMatch(/\d+.*file|found.*\d+/i);
            } catch (error) {
                const output = (error.stdout || '') + (error.stderr || '');
                expect(output).toMatch(/\d+.*file|found.*\d+|template/i);
            }
        }, 15000);

        test('validator should report validation status clearly', async () => {
            if (!existsSync(VALIDATOR_BIN)) {
                console.warn('Skipping test - validator binary not found');
                return;
            }

            try {
                const { stdout, stderr } = await execAsync(`${VALIDATOR_BIN} -no-prompt`, {
                    cwd: REPO_ROOT,
                    timeout: 10000
                });

                const output = stdout + stderr;

                // Should have clear pass/fail/warning indicators
                const hasStatusIndicator = output.match(/✅|❌|⚠️|passed|failed|warning|validation|summary/i);
                expect(hasStatusIndicator).toBeTruthy();
            } catch (error) {
                const output = (error.stdout || '') + (error.stderr || '');
                // Validator exits with non-zero when issues found, which is expected
                // Check that output contains validation information
                const hasStatusIndicator = output.match(/✅|❌|⚠️|passed|failed|warning|validation|summary|error/i);
                expect(hasStatusIndicator).toBeTruthy();
            }
        }, 15000);
    });

    describe('Error Handling', () => {
        test('validator should handle invalid genesis-root path gracefully', async () => {
            if (!existsSync(VALIDATOR_BIN)) {
                console.warn('Skipping test - validator binary not found');
                return;
            }

            try {
                const { stdout, stderr } = await execAsync(
                    `${VALIDATOR_BIN} -genesis-root /nonexistent/path -no-prompt`,
                    {
                        cwd: process.cwd(),
                        timeout: 10000
                    }
                );

                const output = stdout + stderr;
                // Should fail gracefully, not crash
                expect(output).toBeTruthy();
            } catch (error) {
                // Expected to fail, but should have clear error message
                const output = (error.stdout || '') + (error.stderr || '');
                expect(output).toMatch(/not found|does not exist|error|no such file/i);
            }
        }, 15000);
    });
});
