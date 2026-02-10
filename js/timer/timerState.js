/* ============================================
   TIMER STATE - State Management
   ============================================ */

import { CONFIG } from '../config.js';

// Timer state
let timerMinutes = CONFIG.TIMER.DEFAULT_MINUTES;
let timerSeconds = CONFIG.TIMER.DEFAULT_SECONDS;
let timerInterval = null;
let isTimerRunning = false;
let isBreakMode = false;
let completedSessions = 0;

/**
 * Get current timer values
 */
export function getTimerState() {
    return {
        minutes: timerMinutes,
        seconds: timerSeconds,
        isRunning: isTimerRunning,
        isBreakMode: isBreakMode,
        completedSessions: completedSessions
    };
}

/**
 * Set timer values
 */
export function setTimerValues(minutes, seconds) {
    timerMinutes = Math.max(0, minutes);
    timerSeconds = Math.max(0, Math.min(59, seconds));
}

/**
 * Reset timer to default
 */
export function resetTimer() {
    timerMinutes = CONFIG.TIMER.DEFAULT_MINUTES;
    timerSeconds = CONFIG.TIMER.DEFAULT_SECONDS;
}

/**
 * Decrement timer by one second
 * Returns true if timer is complete, false otherwise
 */
export function decrementTimer() {
    if (timerSeconds === 0) {
        if (timerMinutes === 0) {
            return true; // Timer complete
        }
        timerMinutes--;
        timerSeconds = 59;
    } else {
        timerSeconds--;
    }
    return false; // Timer still running
}

/**
 * Start/stop timer interval
 */
export function setTimerInterval(interval) {
    timerInterval = interval;
}

export function clearTimerInterval() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function setTimerRunning(running) {
    isTimerRunning = running;
}

/**
 * Format timer for display
 */
export function formatTimer() {
    const mins = String(timerMinutes).padStart(2, '0');
    const secs = String(timerSeconds).padStart(2, '0');
    return `${mins}:${secs}`;
}

/**
 * Start break mode
 */
export function startBreak() {
    isBreakMode = true;
    const isLongBreak = completedSessions % CONFIG.TIMER.SESSIONS_BEFORE_LONG_BREAK === 0 && completedSessions > 0;
    timerMinutes = isLongBreak ? CONFIG.TIMER.LONG_BREAK_MINUTES : CONFIG.TIMER.BREAK_MINUTES;
    timerSeconds = 0;
}

/**
 * End break mode and return to work
 */
export function endBreak() {
    isBreakMode = false;
    timerMinutes = CONFIG.TIMER.DEFAULT_MINUTES;
    timerSeconds = CONFIG.TIMER.DEFAULT_SECONDS;
}

/**
 * Increment completed sessions
 */
export function incrementCompletedSessions() {
    completedSessions++;
}

/**
 * Reset session counter
 */
export function resetSessionCounter() {
    completedSessions = 0;
}
