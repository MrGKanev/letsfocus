/* ============================================
   FAVICON - Dynamic Favicon Updates
   ============================================ */

/**
 * Update the favicon with a specified emoji
 */
export function updateFavicon(emoji) {
    const link = document.querySelector("link[rel='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>${emoji}</text></svg>`;

    if (!document.querySelector("link[rel='icon']")) {
        document.head.appendChild(link);
    }
}

/**
 * Set favicon to playing state
 */
export function setFaviconPlaying() {
    updateFavicon('🎵');
}

/**
 * Set favicon to paused state
 */
export function setFaviconPaused() {
    updateFavicon('⏸️');
}

/**
 * Set favicon to default state
 */
export function setFaviconDefault() {
    updateFavicon('🎧');
}
