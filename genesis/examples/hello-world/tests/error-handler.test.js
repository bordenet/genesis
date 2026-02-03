import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { getErrorMessage, handleStorageError, handleValidationError, ERROR_MESSAGES } from '../js/error-handler.js';

describe('Error Handler Module', () => {
  describe('ERROR_MESSAGES', () => {
    test('should have all required error types', () => {
      expect(ERROR_MESSAGES.QUOTA_EXCEEDED).toBeDefined();
      expect(ERROR_MESSAGES.DB_NOT_FOUND).toBeDefined();
      expect(ERROR_MESSAGES.DB_CORRUPTED).toBeDefined();
      expect(ERROR_MESSAGES.VALIDATION_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_FORMAT).toBeDefined();
      expect(ERROR_MESSAGES.EXPORT_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.IMPORT_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBeDefined();
    });

    test('each error message should have title, message, and recoveryHint', () => {
      Object.values(ERROR_MESSAGES).forEach(errorMsg => {
        expect(errorMsg.title).toBeDefined();
        expect(typeof errorMsg.title).toBe('string');
        expect(errorMsg.message).toBeDefined();
        expect(typeof errorMsg.message).toBe('string');
        expect(errorMsg.recoveryHint).toBeDefined();
        expect(typeof errorMsg.recoveryHint).toBe('string');
      });
    });
  });

  describe('getErrorMessage', () => {
    test('should return error message for known error code string', () => {
      const result = getErrorMessage('QUOTA_EXCEEDED');
      expect(result).toBe(ERROR_MESSAGES.QUOTA_EXCEEDED);
    });

    test('should return error message for DB_NOT_FOUND code', () => {
      const result = getErrorMessage('DB_NOT_FOUND');
      expect(result).toBe(ERROR_MESSAGES.DB_NOT_FOUND);
    });

    test('should detect quota error from Error object', () => {
      const error = new Error('QuotaExceededError: Storage quota exceeded');
      const result = getErrorMessage(error);
      expect(result).toBe(ERROR_MESSAGES.QUOTA_EXCEEDED);
    });

    test('should detect not found error from Error object', () => {
      const error = new Error('Database not found');
      const result = getErrorMessage(error);
      expect(result).toBe(ERROR_MESSAGES.DB_NOT_FOUND);
    });

    test('should detect no such table error', () => {
      const error = new Error('No such table: projects');
      const result = getErrorMessage(error);
      expect(result).toBe(ERROR_MESSAGES.DB_NOT_FOUND);
    });

    test('should detect corrupt error from Error object', () => {
      const error = new Error('Data is corrupted');
      const result = getErrorMessage(error);
      expect(result).toBe(ERROR_MESSAGES.DB_CORRUPTED);
    });

    test('should detect validation error from Error object', () => {
      const error = new Error('Validation failed');
      const result = getErrorMessage(error);
      expect(result).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
    });

    test('should return UNKNOWN_ERROR for unrecognized errors', () => {
      const error = new Error('Some random error');
      const result = getErrorMessage(error);
      expect(result).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });

    test('should return UNKNOWN_ERROR for null/undefined', () => {
      expect(getErrorMessage(null)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
      expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });

    test('should return UNKNOWN_ERROR for unknown string code', () => {
      const result = getErrorMessage('UNKNOWN_CODE');
      expect(result).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('handleStorageError', () => {
    let mockShowToast;
    let consoleErrorSpy;

    beforeEach(() => {
      mockShowToast = jest.fn();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('should log error to console with context', () => {
      const error = new Error('Test error');
      handleStorageError(error, mockShowToast, 'Test Context');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test Context Error:', error);
    });

    test('should call showToast with formatted message', () => {
      const error = new Error('QuotaExceededError');
      handleStorageError(error, mockShowToast);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('storage is full'),
        'error'
      );
    });

    test('should return error info object', () => {
      const error = new Error('QuotaExceededError');
      const result = handleStorageError(error, mockShowToast);
      expect(result).toBe(ERROR_MESSAGES.QUOTA_EXCEEDED);
    });

    test('should handle missing showToast function', () => {
      const error = new Error('Test error');
      expect(() => handleStorageError(error, null)).not.toThrow();
    });

    test('should use default context when not provided', () => {
      const error = new Error('Test error');
      handleStorageError(error, mockShowToast);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage Operation Error:', error);
    });
  });

  describe('handleValidationError', () => {
    let mockShowToast;

    beforeEach(() => {
      mockShowToast = jest.fn();
    });

    test('should handle single error string', () => {
      const result = handleValidationError('Field is required', mockShowToast);
      expect(result.title).toBe('Validation Error');
      expect(result.message).toBe('Field is required');
      expect(result.errors).toEqual(['Field is required']);
    });

    test('should handle array of errors', () => {
      const errors = ['Name is required', 'Email is invalid'];
      const result = handleValidationError(errors, mockShowToast);
      expect(result.errors).toEqual(errors);
      expect(result.message).toBe('Name is required\nEmail is invalid');
    });

    test('should call showToast with joined message', () => {
      const errors = ['Error 1', 'Error 2'];
      handleValidationError(errors, mockShowToast);
      expect(mockShowToast).toHaveBeenCalledWith('Error 1\nError 2', 'error');
    });

    test('should handle missing showToast function', () => {
      expect(() => handleValidationError('Error', null)).not.toThrow();
    });
  });
});

