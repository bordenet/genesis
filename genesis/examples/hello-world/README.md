# Hello World - Genesis Example

A minimal 2-phase AI workflow app. Open `index.html` and it works.

---

## What This Is

User provides input → AI generates output. Two phases, no build step.

- Stores data in IndexedDB (browser-local)
- Dark mode toggle
- Export/import projects as JSON
- Mock mode for testing without AI
- 50%+ test coverage

---

## Quick Start

```bash
open index.html
```

Or deploy to GitHub Pages:
1. Copy this directory to a new repo
2. Push to GitHub
3. Settings → Pages → Source: main → / (root)
4. Visit `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## Files

```
hello-world/
├── index.html          # The app
├── css/styles.css      # Styles
├── js/
│   ├── app.js          # Entry point
│   ├── workflow.js     # Phase logic
│   ├── storage.js      # IndexedDB
│   └── ai-mock.js      # Mock responses
├── tests/              # Jest + Playwright
├── package.json
└── jest.config.js
```

---

## Usage

1. Open `index.html`
2. Click "New Project", enter a title
3. Phase 1: Enter input, copy prompt to Claude/Gemini, paste response
4. Phase 2: Copy prompt, paste response
5. Export as JSON

**Mock mode**: Toggle "AI Mock Mode" (bottom-right, localhost only) to auto-generate responses.

---

## How It Works

**Phase 1**: You enter input. App generates a prompt. You copy it to an AI, paste the response back.

**Phase 2**: App generates another prompt based on Phase 1. You copy, paste, done.

**Storage**: IndexedDB. Nothing leaves your browser.

---

## Testing

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e

# With coverage
npm run test:coverage
```

---

## Customizing

**Add phases**: Edit `PHASES` array in `js/workflow.js`

**Change prompts**: Edit `generatePrompt()` in `js/workflow.js`

**Styling**: Edit `css/styles.css` or Tailwind classes in `index.html`

---

## Related

- [One-Pager](https://github.com/bordenet/one-pager) — 3-phase document workflow
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant) — Amazon-style press releases
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant) — PRDs

