/* ============================================
   STATUS - Status Message Management (Tailwind)
   ============================================ */

let statusElement = null;

/**
 * Initialize status display
 */
export function initStatus(element) {
    statusElement = element;
}

/**
 * Update status message with optional active state
 */
export function updateStatus(message, isActive = false) {
    if (!statusElement) return;

    statusElement.textContent = message;

    if (isActive) {
        // Add active state with primary color
        statusElement.className = `
            fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2
            text-center text-primary text-xs sm:text-sm
            px-4 sm:px-6 py-1.5 sm:py-2
            bg-black/30 backdrop-blur-md
            rounded-lg border border-primary
            max-w-[85vw] sm:max-w-[90vw] z-[1000]
            transition-all duration-300
            overflow-hidden text-ellipsis whitespace-nowrap
        `.trim().replace(/\s+/g, ' ');
    } else {
        // Default state
        statusElement.className = `
            fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2
            text-center text-white/60 text-xs sm:text-sm
            px-4 sm:px-6 py-1.5 sm:py-2
            bg-black/30 backdrop-blur-md
            rounded-lg border border-white/5
            max-w-[85vw] sm:max-w-[90vw] z-[1000]
            transition-all duration-300
            overflow-hidden text-ellipsis whitespace-nowrap
        `.trim().replace(/\s+/g, ' ');
    }
}
