# LLM Mocking Infrastructure - Implementation Plan

**Priority**: CRITICAL  
**Effort**: 8-12 hours  
**Impact**: Enables full testing without API costs, unblocks A- grade

---

## Objective

Implement comprehensive LLM mocking infrastructure that allows Genesis-generated projects to:
1. Test AI integrations without real API calls
2. Simulate OpenAI and Ollama API responses
3. Test error scenarios (rate limits, network failures, invalid responses)
4. Switch between mock and live modes via environment variables
5. Integrate seamlessly with VS Code development workflow

---

## Architecture

### File Structure
```
genesis/templates/web-app/js/
├── ai-config-template.js          # Configuration and mode switching
├── ai-client-template.js          # Unified client for all LLM providers
├── ai-mock-openai-template.js     # OpenAI API mock
├── ai-mock-ollama-template.js     # Ollama API mock
└── ai-mock-template.js            # Existing mock (keep for backward compatibility)

genesis/templates/testing/
├── ai-client.test-template.js     # Tests for AI client
├── ai-mock-openai.test-template.js # Tests for OpenAI mock
└── ai-mock-ollama.test-template.js # Tests for Ollama mock
```

### Configuration Layer

**File**: `ai-config-template.js`

```javascript
/**
 * AI Configuration
 * Controls mock vs. live mode and provider settings
 */

export const AI_MODE = {
  MOCK: 'mock',
  LIVE: 'live'
};

export const AI_PROVIDER = {
  OPENAI: 'openai',
  OLLAMA: 'ollama'
};

export const AI_CONFIG = {
  // Mode: 'mock' or 'live' (from environment or localStorage)
  mode: process.env.AI_MODE || localStorage.getItem('aiMode') || AI_MODE.MOCK,
  
  // Default provider
  defaultProvider: AI_PROVIDER.OPENAI,
  
  // Provider configurations
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4',
      endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    ollama: {
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: 'llama2'
    }
  },
  
  // Mock responses for testing
  mockResponses: {
    openai: {
      phase1: 'Mock OpenAI response for phase 1...',
      phase2: 'Mock OpenAI response for phase 2...',
      phase3: 'Mock OpenAI response for phase 3...'
    },
    ollama: {
      phase1: 'Mock Ollama response for phase 1...',
      phase2: 'Mock Ollama response for phase 2...',
      phase3: 'Mock Ollama response for phase 3...'
    }
  },
  
  // Error simulation (for testing)
  simulateErrors: {
    enabled: false,
    errorType: 'rate_limit', // 'rate_limit', 'network', 'invalid_response'
    errorRate: 0.1 // 10% of requests fail
  }
};

/**
 * Set AI mode (mock or live)
 */
export function setAIMode(mode) {
  if (!Object.values(AI_MODE).includes(mode)) {
    throw new Error(`Invalid AI mode: ${mode}`);
  }
  AI_CONFIG.mode = mode;
  localStorage.setItem('aiMode', mode);
}

/**
 * Get current AI mode
 */
export function getAIMode() {
  return AI_CONFIG.mode;
}

/**
 * Check if in mock mode
 */
export function isMockMode() {
  return AI_CONFIG.mode === AI_MODE.MOCK;
}
```

### Unified AI Client

**File**: `ai-client-template.js`

```javascript
/**
 * Unified AI Client
 * Handles all LLM provider interactions with automatic mock/live switching
 */

import { AI_CONFIG, isMockMode, AI_PROVIDER } from './ai-config.js';
import { callOpenAIMock } from './ai-mock-openai.js';
import { callOllamaMock } from './ai-mock-ollama.js';

/**
 * Call LLM with automatic mock/live switching
 */
export async function callLLM(prompt, options = {}) {
  const provider = options.provider || AI_CONFIG.defaultProvider;
  const phase = options.phase || 'default';
  
  // Mock mode
  if (isMockMode()) {
    return callMockLLM(provider, prompt, phase);
  }
  
  // Live mode
  return callLiveLLM(provider, prompt, options);
}

/**
 * Call mock LLM
 */
async function callMockLLM(provider, prompt, phase) {
  switch (provider) {
    case AI_PROVIDER.OPENAI:
      return callOpenAIMock(prompt, phase);
    case AI_PROVIDER.OLLAMA:
      return callOllamaMock(prompt, phase);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Call live LLM API
 */
async function callLiveLLM(provider, prompt, options) {
  // Simulate errors if enabled (for testing)
  if (AI_CONFIG.simulateErrors.enabled && Math.random() < AI_CONFIG.simulateErrors.errorRate) {
    throw simulateError(AI_CONFIG.simulateErrors.errorType);
  }
  
  switch (provider) {
    case AI_PROVIDER.OPENAI:
      return callOpenAIAPI(prompt, options);
    case AI_PROVIDER.OLLAMA:
      return callOllamaAPI(prompt, options);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(prompt, options) {
  const config = AI_CONFIG.providers.openai;
  
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: options.model || config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Ollama API
 */
async function callOllamaAPI(prompt, options) {
  const config = AI_CONFIG.providers.ollama;
  
  const response = await fetch(`${config.endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || config.model,
      prompt: prompt,
      stream: false
    })
  });
  
  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.response;
}

/**
 * Simulate API errors for testing
 */
function simulateError(errorType) {
  switch (errorType) {
    case 'rate_limit':
      return new Error('Rate limit exceeded. Please try again later.');
    case 'network':
      return new Error('Network error. Please check your connection.');
    case 'invalid_response':
      return new Error('Invalid response from API.');
    default:
      return new Error('Unknown error occurred.');
  }
}
```

---

## Implementation Steps

### Step 1: Create Configuration Layer (1 hour)
- [ ] Create `ai-config-template.js`
- [ ] Add environment variable support
- [ ] Add localStorage persistence
- [ ] Add mode switching functions

### Step 2: Create Unified Client (2 hours)
- [ ] Create `ai-client-template.js`
- [ ] Implement mock/live switching
- [ ] Add error simulation
- [ ] Add provider abstraction

### Step 3: Create OpenAI Mock (1.5 hours)
- [ ] Create `ai-mock-openai-template.js`
- [ ] Implement response templates
- [ ] Add streaming simulation
- [ ] Add error scenarios

### Step 4: Create Ollama Mock (1.5 hours)
- [ ] Create `ai-mock-ollama-template.js`
- [ ] Implement response templates
- [ ] Match Ollama API format
- [ ] Add error scenarios

### Step 5: Create Tests (3 hours)
- [ ] Test configuration switching
- [ ] Test mock mode responses
- [ ] Test live mode (with mocked fetch)
- [ ] Test error scenarios
- [ ] Test provider switching

### Step 6: Documentation (1 hour)
- [ ] Update README with LLM mocking guide
- [ ] Add VS Code integration instructions
- [ ] Document environment variables
- [ ] Add troubleshooting guide

---

## Success Criteria

- [ ] Can switch between mock and live modes via environment variable
- [ ] OpenAI API calls can be mocked in tests
- [ ] Ollama API calls can be mocked in tests
- [ ] Error scenarios can be simulated
- [ ] 100% test coverage on new code
- [ ] Documentation complete with examples
- [ ] VS Code integration working

---

**Estimated Completion**: 10 hours  
**Expected Grade Impact**: B+ → A- (87 → 90)

