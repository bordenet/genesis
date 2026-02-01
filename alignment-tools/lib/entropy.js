/**
 * Entropy calculation utilities for measuring variance across repositories.
 * Uses Shannon entropy to quantify how much values differ across repos.
 *
 * @module lib/entropy
 */

/**
 * Calculate Shannon entropy for a set of values.
 * Returns a normalized score from 0-100 where:
 * - 0 = all values are identical (perfect alignment)
 * - 100 = maximum variance (every value is different)
 *
 * @param {Array} values - Array of values from each repo
 * @returns {number} Normalized entropy score (0-100)
 */
export function calculateEntropy(values) {
  if (!values || values.length === 0) return 0;

  const counts = {};
  for (const v of values) {
    const key = JSON.stringify(v);
    counts[key] = (counts[key] || 0) + 1;
  }

  const total = values.length;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Normalize to 0-100 scale (max entropy = log2(n) where n = number of repos)
  const maxEntropy = Math.log2(total);
  return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 1000) / 10 : 0;
}

/**
 * Calculate variance statistics for a set of numeric values.
 *
 * @param {number[]} values - Array of numeric values
 * @returns {object} Statistics including min, max, mean, stdDev
 */
export function calculateNumericVariance(values) {
  const nums = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (nums.length === 0) {
    return { min: null, max: null, mean: null, stdDev: null, range: null };
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / nums.length;
  const stdDev = Math.sqrt(variance);

  return {
    min,
    max,
    mean: Math.round(mean * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    range: max - min,
  };
}

/**
 * Determine severity based on entropy score.
 *
 * @param {number} entropy - Entropy score (0-100)
 * @returns {'ok' | 'warning' | 'critical'} Severity level
 */
export function getSeverity(entropy) {
  if (entropy <= 10) return 'ok';
  if (entropy <= 30) return 'warning';
  return 'critical';
}

/**
 * Get status emoji based on severity.
 *
 * @param {'ok' | 'warning' | 'critical'} severity - Severity level
 * @returns {string} Status emoji
 */
export function getStatusEmoji(severity) {
  switch (severity) {
    case 'ok':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '❌';
    default:
      return '❓';
  }
}

