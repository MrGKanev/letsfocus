/* ============================================
   TIMER CONTROLS - Start/Pause/Stop Logic
   ============================================ */

import {
    getTimerState,
    resetTimer,
    decrementTimer,
    setTimerInterval,
    clearTimerInterval,
    setTimerRunning,
    formatTimer,
    startBreak,
    endBreak,
    incrementCompletedSessions,
    resetSessionCounter
} from './timerState.js';
import { startGenerativeMusic, pauseGenerativeMusic, stopGenerativeMusic } from '../audio/audioController.js';
import { updateStatus } from '../ui/status.js';
import { saveSession } from '../ui/sessionHistory.js';
import { getCurrentProfile } from '../ui/profilePicker.js';
import { CONFIG } from '../config.js';

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        } catch (error) {
            console.warn('Notification permission request failed:', error);
        }
    }
}

/**
 * Start the timer
 */
export function startTimer(updateDisplayCallback) {
    const { isRunning } = getTimerState();
    if (isRunning) return;

    setTimerRunning(true);

    // Start generative music
    const message = startGenerativeMusic();
    updateStatus(message, true);

    // Update display immediately
    updateDisplayCallback();

    // Start countdown
    const interval = setInterval(() => {
        const isComplete = decrementTimer();

        if (isComplete) {
            finishSession(updateDisplayCallback);
            return;
        }

        updateDisplayCallback();
    }, 1000);

    setTimerInterval(interval);

    return { isRunning: true, text: 'PAUSE' };
}

/**
 * Pause the timer
 */
export function pauseTimer() {
    const { isRunning } = getTimerState();
    if (!isRunning) return;

    setTimerRunning(false);
    clearTimerInterval();

    // Pause generative music
    const message = pauseGenerativeMusic();
    updateStatus(message, false);

    return { isRunning: false, text: 'RESUME' };
}

/**
 * Stop and reset the timer
 */
export function stopTimer(updateDisplayCallback) {
    const { isBreakMode } = getTimerState();

    setTimerRunning(false);
    clearTimerInterval();

    // Stop generative music
    const message = stopGenerativeMusic();
    updateStatus(message, false);

    // Reset to work mode and clear session counter
    if (isBreakMode) {
        endBreak();
    } else {
        resetTimer();
    }
    resetSessionCounter();
    updateDisplayCallback();

    return { text: 'START', disabled: true };
}

/**
 * Finish timer session
 */
function finishSession(updateDisplayCallback) {
    const { isBreakMode, completedSessions } = getTimerState();

    setTimerRunning(false);
    clearTimerInterval();

    // Stop generative music
    stopGenerativeMusic();

    if (isBreakMode) {
        // Break is complete - return to work mode
        const breakDuration = completedSessions % CONFIG.TIMER.SESSIONS_BEFORE_LONG_BREAK === 0
            ? CONFIG.TIMER.LONG_BREAK_MINUTES
            : CONFIG.TIMER.BREAK_MINUTES;
        const currentProfile = getCurrentProfile();

        // Save break session
        saveSession('break', breakDuration, currentProfile.name);

        endBreak();
        updateDisplayCallback();
        updateStatus(CONFIG.MESSAGES.BREAK_COMPLETE, true);

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('LetsFocus', {
                body: 'Break complete! Ready for next focus session 🚀',
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>✨</text></svg>"
            });
        }

        // Reset status after delay
        setTimeout(() => {
            updateStatus(CONFIG.MESSAGES.READY, false);
        }, CONFIG.TIMER.STATUS_RESET_DELAY);
    } else {
        // Work session complete - start break
        const currentProfile = getCurrentProfile();

        // Save work session
        saveSession('work', CONFIG.TIMER.DEFAULT_MINUTES, currentProfile.name);

        incrementCompletedSessions();
        const newCompletedSessions = completedSessions + 1;
        const isLongBreak = newCompletedSessions % CONFIG.TIMER.SESSIONS_BEFORE_LONG_BREAK === 0;

        startBreak();
        updateDisplayCallback();

        const message = isLongBreak ? CONFIG.MESSAGES.LONG_BREAK_READY : CONFIG.MESSAGES.BREAK_READY;
        updateStatus(message, true);

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notificationBody = isLongBreak
                ? `Great work! Time for a long ${CONFIG.TIMER.LONG_BREAK_MINUTES} minute break 🌟`
                : `Focus session complete! Take a ${CONFIG.TIMER.BREAK_MINUTES} minute break ☕`;

            new Notification('LetsFocus', {
                body: notificationBody,
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🎯</text></svg>"
            });
        }

        // Keep break message visible longer
        setTimeout(() => {
            updateStatus(message, false);
        }, CONFIG.TIMER.STATUS_RESET_DELAY * 2);
    }

    return { text: 'START', disabled: true };
}

/**
 * Get current formatted time
 */
export function getFormattedTime() {
    return formatTimer();
}
