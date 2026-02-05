# Workflow Architecture: Dark Mode Implementation

> Part of [Workflow Architecture Guide](../WORKFLOW-ARCHITECTURE.md)

---

## 🚨 CRITICAL: Dark Mode Implementation

**PROBLEM**: Dark mode toggle has been broken in EVERY project generated from Genesis.

**ROOT CAUSE**: Tailwind CDN defaults to `media` mode (system preference only), not `class` mode (JavaScript toggle).

---

## ✅ Required Fix (MANDATORY)

### In your HTML `<head>` section

```html
<!-- Tailwind CSS with dark mode configuration -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    // CRITICAL: Configure Tailwind dark mode AFTER script loads
    // Without this, dark mode toggle won't work (defaults to 'media' mode)
    // Reference: https://github.com/bordenet/product-requirements-assistant
    tailwind.config = {
        darkMode: 'class'
    }
</script>
```

### In your JavaScript (app.js)

```javascript
/**
 * Load saved theme
 * CRITICAL: This must run BEFORE the app initializes to prevent flash of wrong theme
 */
function loadTheme() {
    // Use localStorage for immediate synchronous access
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}

/**
 * Toggle dark/light theme
 * CRITICAL: This function works with Tailwind's darkMode: 'class' configuration
 */
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// CRITICAL: Load theme BEFORE init to prevent flash of wrong theme
loadTheme();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
```

### In your HTML header

```html
<button type="button" id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle Dark Mode">
    <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>
</button>
```

### Event listener setup

```javascript
// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
```

---

## ✅ Testing Dark Mode

1. Open the deployed app in a browser
2. Click the dark mode toggle button (🌙)
3. The page should immediately switch between light and dark mode
4. Refresh the page - the mode should persist (stored in localStorage)
5. **If nothing happens when clicking the button, the Tailwind config is missing!**

---

## 📚 Reference Implementation

**Study this working example:**
- https://github.com/bordenet/product-requirements-assistant/blob/main/docs/index.html (lines 9-15)
- https://github.com/bordenet/product-requirements-assistant/blob/main/docs/js/app.js (lines 145-165)

**DO NOT modify the pattern - it works perfectly. Just copy it.**

