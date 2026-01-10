# UI Style Guide for {{PROJECT_NAME}}

**Purpose**: This document captures the visual design patterns and UX conventions for {{PROJECT_NAME}}. Use this as a reference when implementing UI features.

## 🧬 Project Lineage

**All projects in this ecosystem derive from https://github.com/bordenet/genesis/**

This style guide ensures UI consistency across all sibling projects.

---

## 🎨 Button Styles & Colors

### Primary Action Buttons

| Button Type | Color Class | Use Case |
|-------------|-------------|----------|
| **Copy/Primary** | `bg-blue-600 hover:bg-blue-700` | Main workflow actions |
| **Save/Success** | `bg-green-600 hover:bg-green-700` | Save operations, external links |
| **Delete/Danger** | `bg-red-600 hover:bg-red-700` | Destructive actions (always requires confirmation) |
| **Secondary** | `bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600` | Back, navigation |
| **Tertiary** | `bg-gray-600 hover:bg-gray-700` | View, informational actions |

---

## 🌗 Dark Mode Requirements (MANDATORY!)

**Every color class MUST have a dark mode counterpart.** This is non-negotiable.

### Dark Mode Checklist

| Light Mode | Dark Mode Equivalent |
|------------|---------------------|
| `bg-white` | `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-900` |
| `bg-gray-100` | `dark:bg-gray-800` |
| `text-gray-900` | `dark:text-white` |
| `text-gray-700` | `dark:text-gray-300` |
| `text-gray-600` | `dark:text-gray-400` |
| `border-gray-200` | `dark:border-gray-700` |
| `border-gray-300` | `dark:border-gray-600` |
| `placeholder:text-gray-500` | `dark:placeholder:text-gray-400` |

### Common Dark Mode Mistakes

❌ **WRONG**: Adding light class without dark equivalent
```html
<div class="bg-white text-gray-900">  <!-- Invisible in dark mode! -->
```

✅ **CORRECT**: Always pair light and dark
```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

---

## ✅ Form Field Patterns

### Required Fields

```html
<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Field Name <span class="text-red-500">*</span>
</label>
```

### Input/Textarea Classes

```
w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
focus:ring-2 focus:ring-blue-500 focus:border-transparent
dark:bg-gray-700 dark:text-white
placeholder:text-gray-500 dark:placeholder:text-gray-400
```

**CRITICAL**: Always include ALL of these classes together. Missing `dark:text-white` or placeholder classes causes invisible text in dark mode.

---

## 🔧 Utility Function Conventions (CRITICAL!)

### Clipboard Operations (`copyToClipboard`)

The `copyToClipboard` function follows a **throw-on-error** pattern.

**Implementation Pattern:**
```javascript
export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}
```

**Caller Pattern:**
```javascript
try {
  await copyToClipboard(textToCopy);
  showToast('Copied to clipboard!', 'success');
} catch {
  showToast('Failed to copy to clipboard', 'error');
}
```

**Rules:**
1. ✅ `copyToClipboard` MUST throw on error (not return boolean)
2. ✅ `copyToClipboard` MUST NOT show toast internally
3. ✅ Callers MUST handle their own success/error toasts
4. ✅ Callers MAY customize toast message for context

---

## 🪟 Modal Dialogs

### Standard Modal Structure

- **Background**: `bg-black bg-opacity-50` (semi-transparent overlay)
- **Modal container**: `bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh]`
- **Header**: Title + close button (×) in top-right
- **Content area**: Scrollable, `bg-gray-50 dark:bg-gray-900` background
- **Footer**: Action buttons (primary right, secondary left)
- **Dismissal**: Click ×, click Close button, click backdrop, or press Escape

---

## 🧪 Test Coverage for UI Workflows

Ensure these test cases exist:

1. **Button rendering**: Verify correct buttons appear on each view
2. **Button state**: Test disabled/enabled states
3. **Modal behavior**: Test open, close (all methods), escape key
4. **Clipboard operations**: Test `copyToClipboard` throws on error
5. **Dark mode rendering**: Verify text visibility in both themes

### Clipboard Test Example

```javascript
describe('copyToClipboard', () => {
  it('should call clipboard.writeText with provided text', async () => {
    await copyToClipboard('test text');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
  });

  it('should throw error on failure (callers must handle)', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Denied'));
    await expect(copyToClipboard('test')).rejects.toThrow('Denied');
  });

  it('should not show any toast notifications internally', async () => {
    document.body.innerHTML = '';
    await copyToClipboard('test text');
    expect(document.getElementById('toast-container')).toBeNull();
  });
});
```

---

**Reference**: See `js/ui.js` for implementation details.

