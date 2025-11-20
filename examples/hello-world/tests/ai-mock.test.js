import { describe, test, expect, beforeEach } from '@jest/globals';
import { initMockMode, setMockMode, isMockMode, getMockResponse, addMockResponse } from '../js/ai-mock.js';

describe('AI Mock Module', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset mock mode
    setMockMode(false);
  });

  describe('initMockMode', () => {
    test('should initialize with false by default', () => {
      const result = initMockMode();
      expect(result).toBe(false);
    });

    test('should read from localStorage if set', () => {
      localStorage.setItem('aiMockMode', 'true');
      const result = initMockMode();
      expect(result).toBe(true);
    });
  });

  describe('setMockMode', () => {
    test('should enable mock mode', () => {
      setMockMode(true);
      expect(isMockMode()).toBe(true);
    });

    test('should disable mock mode', () => {
      setMockMode(true);
      setMockMode(false);
      expect(isMockMode()).toBe(false);
    });

    test('should persist to localStorage', () => {
      setMockMode(true);
      expect(localStorage.getItem('aiMockMode')).toBe('true');
    });
  });

  describe('isMockMode', () => {
    test('should return false by default', () => {
      expect(isMockMode()).toBe(false);
    });

    test('should return true when enabled', () => {
      setMockMode(true);
      expect(isMockMode()).toBe(true);
    });
  });

  describe('getMockResponse', () => {
    test('should return mock response for phase 1', async () => {
      const response = await getMockResponse(1);
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    test('should return mock response for phase 2', async () => {
      const response = await getMockResponse(2);
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    test('should return default message for unknown phase', async () => {
      const response = await getMockResponse(999);
      expect(response).toContain('not available');
    });

    test('should simulate network delay', async () => {
      const start = Date.now();
      await getMockResponse(1);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(500);
    });
  });

  describe('addMockResponse', () => {
    test('should add custom mock response', async () => {
      const customResponse = 'Custom test response';
      addMockResponse(3, customResponse);
      
      const response = await getMockResponse(3);
      expect(response).toBe(customResponse);
    });

    test('should override existing mock response', async () => {
      const customResponse = 'Override response';
      addMockResponse(1, customResponse);
      
      const response = await getMockResponse(1);
      expect(response).toBe(customResponse);
    });
  });
});

