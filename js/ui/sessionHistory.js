/* ============================================
   SESSION HISTORY - Track completed sessions
   ============================================ */

const STORAGE_KEY = 'letsfocus_sessions';
const MAX_SESSIONS = 100;

/**
 * Get session history from localStorage
 */
function getSessionHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn('Failed to load session history:', error);
        return [];
    }
}

/**
 * Save session to history
 * @param {string} type - 'work' or 'break'
 * @param {number} duration - Duration in minutes
 * @param {string} profile - Sound profile name
 */
export function saveSession(type, duration, profile) {
    try {
        const sessions = getSessionHistory();

        sessions.unshift({
            type,
            duration,
            profile,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        });

        // Keep only last MAX_SESSIONS
        if (sessions.length > MAX_SESSIONS) {
            sessions.length = MAX_SESSIONS;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.warn('Failed to save session:', error);
    }
}
