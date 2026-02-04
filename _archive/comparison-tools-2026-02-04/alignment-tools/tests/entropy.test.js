/**
 * Tests for lib/entropy.js
 */
import {
  calculateEntropy,
  calculateNumericVariance,
  getSeverity,
  getStatusEmoji,
} from '../lib/entropy.js';

describe('calculateEntropy', () => {
  test('returns 0 for empty array', () => {
    expect(calculateEntropy([])).toBe(0);
  });

  test('returns 0 for null input', () => {
    expect(calculateEntropy(null)).toBe(0);
  });

  test('returns 0 for all identical values', () => {
    expect(calculateEntropy([50, 50, 50, 50, 50])).toBe(0);
  });

  test('returns 0 for all identical strings', () => {
    expect(calculateEntropy(['test', 'test', 'test'])).toBe(0);
  });

  test('returns non-zero for varying values', () => {
    const entropy = calculateEntropy([50, 50, 50, 50, 50, 85]);
    expect(entropy).toBeGreaterThan(0);
    expect(entropy).toBeLessThan(100);
  });

  test('returns higher entropy for more variance', () => {
    const lowVariance = calculateEntropy([50, 50, 50, 50, 50, 55]);
    const highVariance = calculateEntropy([10, 20, 30, 40, 50, 60]);
    expect(highVariance).toBeGreaterThan(lowVariance);
  });

  test('returns 100 for all unique values', () => {
    const entropy = calculateEntropy([1, 2, 3, 4, 5, 6]);
    expect(entropy).toBe(100);
  });

  test('handles mixed types via JSON serialization', () => {
    const entropy = calculateEntropy([50, '50', 50]);
    // 50 and '50' are different when JSON.stringify'd
    expect(entropy).toBeGreaterThan(0);
  });

  test('handles objects correctly', () => {
    const entropy = calculateEntropy([{ a: 1 }, { a: 1 }, { a: 2 }]);
    expect(entropy).toBeGreaterThan(0);
  });

  test('identical objects produce 0 entropy', () => {
    const entropy = calculateEntropy([{ a: 1 }, { a: 1 }, { a: 1 }]);
    expect(entropy).toBe(0);
  });
});

describe('calculateNumericVariance', () => {
  test('returns nulls for empty array', () => {
    const result = calculateNumericVariance([]);
    expect(result).toEqual({
      min: null,
      max: null,
      mean: null,
      stdDev: null,
      range: null,
    });
  });

  test('returns correct stats for single value', () => {
    const result = calculateNumericVariance([50]);
    expect(result.min).toBe(50);
    expect(result.max).toBe(50);
    expect(result.mean).toBe(50);
    expect(result.stdDev).toBe(0);
    expect(result.range).toBe(0);
  });

  test('returns correct stats for multiple values', () => {
    const result = calculateNumericVariance([10, 20, 30, 40, 50]);
    expect(result.min).toBe(10);
    expect(result.max).toBe(50);
    expect(result.mean).toBe(30);
    expect(result.range).toBe(40);
    expect(result.stdDev).toBeGreaterThan(0);
  });

  test('filters out non-numeric values', () => {
    const result = calculateNumericVariance([10, 'invalid', 20, null, 30]);
    expect(result.min).toBe(10);
    expect(result.max).toBe(30);
    expect(result.mean).toBe(20);
  });

  test('handles NaN values', () => {
    const result = calculateNumericVariance([10, NaN, 20]);
    expect(result.min).toBe(10);
    expect(result.max).toBe(20);
  });
});

describe('getSeverity', () => {
  test('returns ok for entropy <= 10', () => {
    expect(getSeverity(0)).toBe('ok');
    expect(getSeverity(5)).toBe('ok');
    expect(getSeverity(10)).toBe('ok');
  });

  test('returns warning for entropy 11-30', () => {
    expect(getSeverity(11)).toBe('warning');
    expect(getSeverity(20)).toBe('warning');
    expect(getSeverity(30)).toBe('warning');
  });

  test('returns critical for entropy > 30', () => {
    expect(getSeverity(31)).toBe('critical');
    expect(getSeverity(50)).toBe('critical');
    expect(getSeverity(100)).toBe('critical');
  });
});

describe('getStatusEmoji', () => {
  test('returns correct emoji for each severity', () => {
    expect(getStatusEmoji('ok')).toBe('✅');
    expect(getStatusEmoji('warning')).toBe('⚠️');
    expect(getStatusEmoji('critical')).toBe('❌');
  });

  test('returns question mark for unknown severity', () => {
    expect(getStatusEmoji('unknown')).toBe('❓');
    expect(getStatusEmoji(null)).toBe('❓');
  });
});

