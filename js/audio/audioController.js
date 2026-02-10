/* ============================================
   AUDIO CONTROLLER - Music Control Functions
   ============================================ */

import * as Tone from 'tone';
import { createEngine, stopEngine, disposeEngine } from './profileEngine.js';
import { getDefaultProfile } from './soundProfiles.js';
import { CONFIG } from '../config.js';
import { setFaviconPlaying, setFaviconPaused, setFaviconDefault } from '../ui/favicon.js';

let isPlaying = false;
let currentProfile = getDefaultProfile();

/**
 * Set the current sound profile
 */
export function setProfile(profile) {
    const wasPlaying = isPlaying;

    // Stop current sound
    if (isPlaying) {
        stopGenerativeMusic();
    }

    // Update profile
    currentProfile = profile;

    // Restart if it was playing
    if (wasPlaying) {
        startGenerativeMusic();
    }
}

/**
 * Start the generative music with current profile
 */
export async function startGenerativeMusic() {
    if (isPlaying) return;

    try {
        // Create and start engine for current profile
        await createEngine(currentProfile);

        isPlaying = true;
        setFaviconPlaying();
        return `♪ ${currentProfile.name} - ${currentProfile.description}`;
    } catch (error) {
        console.error('Failed to start music:', error);
        return 'Failed to start music';
    }
}

/**
 * Pause the generative music (keeps loops alive)
 */
export function pauseGenerativeMusic() {
    if (!isPlaying) return;

    // Pause transport instead of stopping
    Tone.Transport.pause();

    // Stop the engine
    stopEngine();

    isPlaying = false;
    setFaviconPaused();
    return CONFIG.MESSAGES.MUSIC_PAUSED;
}

/**
 * Stop the generative music completely
 */
export function stopGenerativeMusic() {
    if (!isPlaying) return;

    // Stop transport
    Tone.Transport.stop();

    // Dispose engine
    disposeEngine();

    isPlaying = false;
    setFaviconDefault();
    return CONFIG.MESSAGES.MUSIC_STOPPED;
}

/**
 * Check if music is currently playing
 */
export function isMusicPlaying() {
    return isPlaying;
}

/**
 * Get current profile
 */
export function getCurrentProfile() {
    return currentProfile;
}
