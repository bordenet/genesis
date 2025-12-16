// Jest setup file
import 'fake-indexeddb/auto';

// Polyfill structuredClone for Node.js < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Note: window.location is provided by JSDOM and defaults to 'about:blank'
// Tests that need to check localhost behavior should use the actual JSDOM location
// or mock the isLocalhost function directly in the module being tested

// Mock navigator.clipboard
global.navigator.clipboard = {
  writeText: () => Promise.resolve()
};

// Mock alert, confirm, prompt
global.alert = () => {};
global.confirm = () => true;
global.prompt = () => null;

