/* ============================================
   KEYBOARD SHORTCUTS - Global key bindings
   ============================================ */

import { getTimerState } from '../timer/timerState.js';

/**
 * Initialize keyboard shortcuts
 * @param {Object} handlers - Object containing handler functions
 * @param {Function} handlers.onStartPause - Called when Space is pressed
 * @param {Function} handlers.onReset - Called when R is pressed
 * @param {Function} handlers.onIncreaseTime - Called when +/= is pressed
 * @param {Function} handlers.onDecreaseTime - Called when - is pressed
 * @param {Function} handlers.onSelectProfile - Called when 1-9 is pressed (receives profile index)
 */
export function initKeyboardShortcuts(handlers) {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key.toLowerCase()) {
            case ' ':
            case 'spacebar':
                e.preventDefault();
                handlers.onStartPause?.();
                break;

            case 'r':
                e.preventDefault();
                handlers.onReset?.();
                break;

            case '+':
            case '=': {
                e.preventDefault();
                const { isRunning: isRunningIncrease } = getTimerState();
                if (!isRunningIncrease) {
                    handlers.onIncreaseTime?.();
                }
                break;
            }

            case '-':
            case '_': {
                e.preventDefault();
                const { isRunning: isRunningDecrease } = getTimerState();
                if (!isRunningDecrease) {
                    handlers.onDecreaseTime?.();
                }
                break;
            }

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9': {
                e.preventDefault();
                const profileIndex = parseInt(e.key) - 1;
                handlers.onSelectProfile?.(profileIndex);
                break;
            }

            case '?':
                e.preventDefault();
                showKeyboardShortcutsHelp();
                break;
        }
    });
}

/**
 * Show keyboard shortcuts help
 */
function showKeyboardShortcutsHelp() {
    const helpText = `
Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━━━
Space  - Start/Pause timer
R      - Reset timer
+/=    - Add 5 minutes
-      - Remove 5 minutes
1-9    - Select sound profile
?      - Show this help
    `.trim();

    // Use console for now - could be upgraded to a modal later
    console.log(helpText);

    // Also show a brief notification in the status area if available
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        const originalText = statusDiv.textContent;
        const originalColor = statusDiv.className;

        statusDiv.textContent = 'Press ? for keyboard shortcuts (check console)';
        statusDiv.className = 'text-lg text-white/80';

        setTimeout(() => {
            statusDiv.textContent = originalText;
            statusDiv.className = originalColor;
        }, 3000);
    }
}
