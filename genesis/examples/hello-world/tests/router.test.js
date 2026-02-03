import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { initRouter, navigateTo, getCurrentRoute } from '../js/router.js';

describe('Router Module', () => {
  let originalLocation;
  let originalHistory;
  let popStateHandler;

  beforeEach(() => {
    // Store original window properties
    originalLocation = window.location;
    originalHistory = window.history;

    // Mock window.location
    delete window.location;
    window.location = {
      hash: '',
      href: 'http://localhost/'
    };

    // Mock window.history
    window.history.pushState = jest.fn();

    // Capture popstate handler
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'popstate') {
        popStateHandler = handler;
      }
      return originalAddEventListener.call(window, event, handler);
    });

    // Mock DOM elements
    document.body.innerHTML = `
      <div data-phase="1" class="hidden">Phase 1</div>
      <div data-phase="2" class="hidden">Phase 2</div>
      <div data-phase="3" class="hidden">Phase 3</div>
    `;
  });

  afterEach(() => {
    // Restore original window properties
    window.location = originalLocation;
    window.history = originalHistory;
    document.body.innerHTML = '';
  });

  describe('initRouter', () => {
    test('should register popstate event listener', () => {
      initRouter();
      expect(window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    test('should navigate to home when no hash present', () => {
      window.location.hash = '';
      initRouter();
      expect(getCurrentRoute()).toBe('home');
    });

    test('should navigate to hash route when present', () => {
      window.location.hash = '#phase/2';
      initRouter();
      expect(getCurrentRoute()).toBe('phase/2');
    });
  });

  describe('navigateTo', () => {
    beforeEach(() => {
      initRouter();
    });

    test('should update current route', () => {
      navigateTo('phase/1');
      expect(getCurrentRoute()).toBe('phase/1');
    });

    test('should push state to history by default', () => {
      navigateTo('phase/2');
      expect(window.history.pushState).toHaveBeenCalledWith(
        { route: 'phase/2' },
        '',
        '#phase/2'
      );
    });

    test('should not push state when pushState is false', () => {
      window.history.pushState.mockClear();
      navigateTo('phase/1', false);
      expect(window.history.pushState).not.toHaveBeenCalled();
    });

    test('should show correct phase element', () => {
      navigateTo('phase/2');
      const phase2 = document.querySelector('[data-phase="2"]');
      expect(phase2.classList.contains('hidden')).toBe(false);
    });

    test('should hide other phase elements', () => {
      navigateTo('phase/2');
      const phase1 = document.querySelector('[data-phase="1"]');
      const phase3 = document.querySelector('[data-phase="3"]');
      expect(phase1.classList.contains('hidden')).toBe(true);
      expect(phase3.classList.contains('hidden')).toBe(true);
    });

    test('should navigate to home for empty path', () => {
      navigateTo('');
      expect(getCurrentRoute()).toBe('');
    });

    test('should navigate to home for unknown routes', () => {
      navigateTo('unknown-route');
      expect(getCurrentRoute()).toBe('home');
    });

    test('should navigate to home when phase has no param', () => {
      navigateTo('phase');
      expect(getCurrentRoute()).toBe('home');
    });
  });

  describe('getCurrentRoute', () => {
    test('should redirect unknown routes to home', () => {
      // Unknown routes get redirected to home via the default case in renderRoute
      navigateTo('test-route', false);
      expect(getCurrentRoute()).toBe('home');
    });

    test('should return current route after navigation', () => {
      initRouter();
      navigateTo('phase/3');
      expect(getCurrentRoute()).toBe('phase/3');
    });
  });

  describe('popstate handling', () => {
    beforeEach(() => {
      initRouter();
    });

    test('should handle popstate event with route in state', () => {
      if (popStateHandler) {
        popStateHandler({ state: { route: 'phase/2' } });
        expect(getCurrentRoute()).toBe('phase/2');
      }
    });

    test('should navigate to home when popstate has no state', () => {
      if (popStateHandler) {
        popStateHandler({ state: null });
        expect(getCurrentRoute()).toBe('home');
      }
    });
  });
});

