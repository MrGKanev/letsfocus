/* ============================================
   VOLUME CONTROLLER - Master Volume Control
   ============================================ */

import * as Tone from 'tone';

const DEFAULT_VOLUME = 70; // 70%
let currentVolume = DEFAULT_VOLUME;

/**
 * Convert percentage (0-100) to decibels (-60 to 0)
 */
function percentageToDb(percentage) {
    if (percentage === 0) return -60;
    // Map 0-100% to -60dB to 0dB logarithmically
    return (percentage / 100) * 60 - 60;
}

/**
 * Set the master volume
 * @param {number} percentage - Volume percentage (0-100)
 */
export function setMasterVolume(percentage) {
    currentVolume = Math.max(0, Math.min(100, percentage));
    const db = percentageToDb(currentVolume);
    Tone.getDestination().volume.value = db;
}

/**
 * Get current volume percentage
 */
export function getCurrentVolume() {
    return currentVolume;
}

/**
 * Initialize volume to default
 */
export function initVolume() {
    setMasterVolume(DEFAULT_VOLUME);
}
