/**
 * Simple Router Module
 * Handles client-side routing and navigation
 * @module router
 */

/** @type {string | null} */
let currentRoute = null;

/**
 * Initialize the router
 * @returns {void}
 */
export function initRouter() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', handlePopState);

  // Handle initial route
  const path = window.location.hash.slice(1) || 'home';
  navigateTo(path, false);
}

/**
 * Navigate to a route
 * @param {string} route - Route to navigate to
 * @param {boolean} pushState - Whether to push to browser history
 */
export function navigateTo(route, pushState = true) {
  const [path, param] = route.split('/');

  if (pushState) {
    window.history.pushState({ route }, '', `#${route}`);
  }

  currentRoute = route;
  renderRoute(path, param);
}

/**
 * Handle browser back/forward
 * @param {PopStateEvent} event - Browser popstate event
 */
function handlePopState(event) {
  const route = event.state?.route || 'home';
  navigateTo(route, false);
}

/**
 * Render the current route
 * @param {string} path - Route path
 * @param {string} param - Route parameter
 */
async function renderRoute(path, param) {
  try {
    switch (path) {
    case 'home':
    case '':
      // Show home/list view
      showPhase(1);
      break;

    case 'phase':
      if (param) {
        showPhase(parseInt(param, 10));
      } else {
        navigateTo('home');
      }
      break;

    default:
      navigateTo('home');
      break;
    }
  } catch (error) {
    console.error('Route rendering error:', error);
    navigateTo('home');
  }
}

/**
 * Show a specific phase
 * @param {number} phaseNumber - Phase number to show
 */
function showPhase(phaseNumber) {
  // Hide all phases
  document.querySelectorAll('[data-phase]').forEach(el => {
    el.classList.add('hidden');
  });

  // Show requested phase
  const phaseEl = document.querySelector(`[data-phase="${phaseNumber}"]`);
  if (phaseEl) {
    phaseEl.classList.remove('hidden');
  }
}

/**
 * Get current route
 * @returns {string | null} Current route
 */
export function getCurrentRoute() {
  return currentRoute;
}

