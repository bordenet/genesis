/**
 * Report generation utilities for scan results.
 *
 * @module lib/report-generator
 */

import { getSeverity, getStatusEmoji } from './entropy.js';

/**
 * Generate a console-formatted report.
 *
 * @param {object} scanResults - Complete scan results
 * @returns {string} Formatted console output
 */
export function generateConsoleReport(scanResults) {
  const lines = [];
  const { dimensions, repos, timestamp, overallEntropy } = scanResults;

  // Header
  lines.push('');
  lines.push('╔══════════════════════════════════════════════════════════════════╗');
  lines.push('║                    GENESIS ALIGNMENT SCAN v2                      ║');
  lines.push('╠══════════════════════════════════════════════════════════════════╣');
  lines.push(`║ Repos: ${repos.length.toString().padEnd(3)} | Dimensions: ${dimensions.length.toString().padEnd(2)} | ${timestamp.slice(0, 19).padEnd(24)} ║`);
  lines.push('╚══════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Dimension table
  lines.push('┌─────────────────────┬─────────┬────────┬─────────────────────────┐');
  lines.push('│ Dimension           │ Entropy │ Status │ Top Issue               │');
  lines.push('├─────────────────────┼─────────┼────────┼─────────────────────────┤');

  for (const dim of dimensions) {
    const severity = getSeverity(dim.entropy);
    const emoji = getStatusEmoji(severity);
    const topIssue = dim.findings?.[0]?.summary || '-';
    const truncatedIssue = topIssue.length > 23 ? topIssue.slice(0, 20) + '...' : topIssue;

    lines.push(
      `│ ${dim.name.padEnd(19)} │ ${dim.entropy.toFixed(1).padStart(5)}% │   ${emoji}   │ ${truncatedIssue.padEnd(23)} │`
    );
  }

  lines.push('└─────────────────────┴─────────┴────────┴─────────────────────────┘');
  lines.push('');

  // Summary
  const overallSeverity = getSeverity(overallEntropy);
  const overallEmoji = getStatusEmoji(overallSeverity);
  lines.push(`OVERALL ENTROPY: ${overallEntropy.toFixed(1)}% ${overallEmoji} (Target: <10%)`);
  lines.push('');

  // Warnings
  const warnings = dimensions.filter((d) => getSeverity(d.entropy) !== 'ok');
  if (warnings.length > 0) {
    lines.push(`⚠️  ${warnings.length} dimension(s) need attention`);
    lines.push('📋 Run with --format json for detailed findings');
  } else {
    lines.push('✅ All dimensions within acceptable variance');
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate a JSON report.
 *
 * @param {object} scanResults - Complete scan results
 * @returns {string} JSON string
 */
export function generateJsonReport(scanResults) {
  return JSON.stringify(scanResults, null, 2);
}

/**
 * Generate a markdown report.
 *
 * @param {object} scanResults - Complete scan results
 * @returns {string} Markdown string
 */
export function generateMarkdownReport(scanResults) {
  const lines = [];
  const { dimensions, repos, timestamp, overallEntropy } = scanResults;

  lines.push('# Genesis Alignment Scan Report');
  lines.push('');
  lines.push(`**Date:** ${timestamp}`);
  lines.push(`**Repos Scanned:** ${repos.length}`);
  lines.push(`**Overall Entropy:** ${overallEntropy.toFixed(1)}%`);
  lines.push('');
  lines.push('## Summary by Dimension');
  lines.push('');
  lines.push('| Dimension | Entropy | Status | Top Issue |');
  lines.push('|-----------|---------|--------|-----------|');

  for (const dim of dimensions) {
    const severity = getSeverity(dim.entropy);
    const emoji = getStatusEmoji(severity);
    const topIssue = dim.findings?.[0]?.summary || '-';
    lines.push(`| ${dim.name} | ${dim.entropy.toFixed(1)}% | ${emoji} | ${topIssue} |`);
  }

  lines.push('');

  // Detailed findings
  const withFindings = dimensions.filter((d) => d.findings?.length > 0);
  if (withFindings.length > 0) {
    lines.push('## Detailed Findings');
    lines.push('');
    for (const dim of withFindings) {
      lines.push(`### ${dim.name}`);
      lines.push('');
      for (const finding of dim.findings) {
        lines.push(`- **${finding.repo}**: ${finding.summary} (${finding.severity})`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Write report to file.
 *
 * @param {string} content - Report content
 * @param {string} outputPath - Output file path
 */
export async function writeReport(content, outputPath) {
  const fs = await import('fs');
  fs.default.writeFileSync(outputPath, content);
}

