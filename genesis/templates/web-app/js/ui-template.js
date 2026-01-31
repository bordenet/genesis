/**
 * UI Utilities Module
 * Handles common UI operations like toasts, modals, loading states
 * 
 * Provides reusable UI components and utilities for:
 * - Toast notifications (success, error, warning, info)
 * - Loading overlays
 * - Confirmation dialogs
 * - Date/time formatting
 * - Clipboard operations
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
        <span class="text-xl">${icons[type]}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show loading overlay
 * @param {string} text - Loading message (default: 'Loading...')
 */
export function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = text;
    overlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
}

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (default: 'Confirm')
 * @returns {Promise<boolean>} True if confirmed, false if cancelled
 */
export function confirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-xl">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">${title}</h3>
                <p class="text-gray-700 dark:text-gray-300 mb-6">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancel-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#confirm-btn').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        modal.querySelector('#cancel-btn').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

/**
 * Format date for display
 * Shows relative time for recent dates, absolute date for older ones
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date string
 */
export function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format bytes for display
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Copy text to clipboard
 *
 * IMPORTANT: This function throws on error and does NOT show toast notifications.
 * Callers are responsible for handling errors and showing appropriate feedback.
 * This pattern allows callers to customize messages (e.g., "Prompt copied!" vs "URL copied!").
 *
 * Uses a fallback chain for maximum compatibility:
 * 1. Modern Clipboard API (navigator.clipboard.writeText)
 * 2. Legacy execCommand('copy') for older browsers and iPad/mobile
 *
 * @param {string} text - Text to copy
 * @returns {Promise<void>} Resolves if successful, throws if failed
 * @throws {Error} If clipboard access fails
 *
 * @example
 * // Caller handles success/error feedback
 * try {
 *   await copyToClipboard(promptText);
 *   showToast('Prompt copied to clipboard!', 'success');
 * } catch {
 *   showToast('Failed to copy prompt', 'error');
 * }
 */
export async function copyToClipboard(text) {
    // Modern Clipboard API with Safari-compatible ClipboardItem pattern
    // Using ClipboardItem ensures the API call is synchronous (satisfying
    // Safari's transient activation requirement) while data resolution is async
    if (navigator.clipboard && window.isSecureContext) {
        try {
            const blob = new Blob([text], { type: 'text/plain' });
            const item = new ClipboardItem({
                'text/plain': Promise.resolve(blob)
            });
            await navigator.clipboard.write([item]);
            return;
        } catch (err) {
            // Fall through to legacy method on any failure
            // Safari may throw NotAllowedError, TypeError, or fail silently
            console.warn('Clipboard API failed, trying fallback:', err?.message);
        }
    }

    // Fallback for iOS Safari <13.4, permission denied, or API failure
    // CRITICAL: Position IN viewport - iOS Safari rejects off-screen elements
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent iOS keyboard from appearing
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('contenteditable', 'true');
    // Position IN viewport but invisible (iOS requirement)
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.width = '0';
    textarea.style.height = '0';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.style.zIndex = '-1';
    textarea.style.pointerEvents = 'none';
    // Prevent zoom on iOS (font-size < 16px triggers zoom)
    textarea.style.fontSize = '16px';

    document.body.appendChild(textarea);

    try {
        textarea.focus();
        // iOS requires setSelectionRange instead of select()
        textarea.setSelectionRange(0, text.length);

        const successful = document.execCommand('copy');
        if (!successful) {
            throw new Error('execCommand copy returned false');
        }
    } catch (err) {
        throw new Error('Failed to copy to clipboard: ' + (err?.message || 'unknown error'));
    } finally {
        // Always clean up, even on error
        if (document.body.contains(textarea)) {
            document.body.removeChild(textarea);
        }
    }
}

/**
 * Show full prompt in a modal dialog
 * Displays the complete prompt with copy functionality
 * @param {string} prompt - Full prompt text to display
 * @param {string} title - Modal title (default: 'Full Prompt')
 * @param {Function} [onCopySuccess] - Optional callback to run after successful copy (e.g., enable workflow progression)
 */
export function showPromptModal(prompt, title = 'Full Prompt', onCopySuccess = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">${title}</h3>
                <button id="close-prompt-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="flex-1 overflow-auto p-4">
                <pre class="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${escapeHtml(prompt)}</pre>
            </div>
            <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button id="copy-modal-prompt" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    📋 Copy to Clipboard
                </button>
                <button id="close-modal-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();

    modal.querySelector('#close-prompt-modal').addEventListener('click', closeModal);
    modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);
    modal.querySelector('#copy-modal-prompt').addEventListener('click', async () => {
        try {
            await copyToClipboard(prompt);
            showToast('Copied to clipboard!', 'success');
            // Run callback to enable workflow progression (Open AI button, textarea, etc.)
            if (onCopySuccess) {
                onCopySuccess();
            }
        } catch {
            showToast('Failed to copy to clipboard', 'error');
        }
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/**
 * Show document preview modal with formatted markdown
 * Displays the final document with copy and download options
 * Uses marked.js for markdown rendering (must be loaded via CDN)
 * @param {string} markdown - Markdown content to display
 * @param {string} title - Modal title (default: 'Document Preview')
 * @param {string} filename - Filename for download (default: 'document.md')
 */
export function showDocumentPreviewModal(markdown, title = 'Document Preview', filename = 'document.md') {
    // Check if marked is available
    if (typeof marked === 'undefined') {
        console.error('marked.js is not loaded. Add <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script> to your HTML.');
        showToast('Preview not available - marked.js not loaded', 'error');
        return;
    }

    // Configure marked for safe rendering
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    const renderedHtml = marked.parse(markdown);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">${escapeHtml(title)}</h3>
                <button id="close-preview-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="flex-1 overflow-auto p-6">
                <div class="prose prose-sm dark:prose-invert max-w-none markdown-preview">
                    ${renderedHtml}
                </div>
            </div>
            <div class="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    💡 Copy to paste into Word, Google Docs, or Notion with formatting preserved
                </p>
                <div class="flex gap-3">
                    <button id="copy-preview-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Copy All
                    </button>
                    <button id="download-preview-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download .md
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();

    modal.querySelector('#close-preview-modal').addEventListener('click', closeModal);

    // Copy formatted content (HTML for rich paste)
    modal.querySelector('#copy-preview-btn').addEventListener('click', async () => {
        try {
            // Try to copy as rich text (HTML) for better paste experience
            const previewContent = modal.querySelector('.markdown-preview');
            if (navigator.clipboard && navigator.clipboard.write) {
                const blob = new Blob([previewContent.innerHTML], { type: 'text/html' });
                const plainBlob = new Blob([markdown], { type: 'text/plain' });
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': blob,
                        'text/plain': plainBlob
                    })
                ]);
            } else {
                // Fallback to plain text
                await copyToClipboard(markdown);
            }
            showToast('Copied to clipboard!', 'success');
        } catch {
            // Final fallback
            try {
                await copyToClipboard(markdown);
                showToast('Copied as plain text', 'success');
            } catch {
                showToast('Failed to copy to clipboard', 'error');
            }
        }
    });

    // Download as markdown file
    modal.querySelector('#download-preview-btn').addEventListener('click', () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded ' + filename, 'success');
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}
