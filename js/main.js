/* ============================================
   MAIN - Application Initialization & Events
   ============================================ */

import { startTimer, pauseTimer, stopTimer, getFormattedTime, requestNotificationPermission } from './timer/timerControls.js';
import { getTimerState, setTimerValues } from './timer/timerState.js';
import { initStatus, updateStatus } from './ui/status.js';
import { initProfilePicker, getCurrentProfile, selectProfileByIndex } from './ui/profilePicker.js';
import { setProfile } from './audio/audioController.js';
import { initVolume, setMasterVolume } from './audio/volumeController.js';
import { initKeyboardShortcuts } from './ui/keyboardShortcuts.js';
import { CONFIG } from './config.js';

// DOM Elements
let timerDisplay, startBtn, stopBtn, statusDiv, profileGrid, increaseTimeBtn, decreaseTimeBtn, volumeSlider;

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.textContent = getFormattedTime();
    }
}

/**
 * Update start button state
 */
function updateStartButton() {
    const { isRunning } = getTimerState();
    if (startBtn) {
        startBtn.textContent = isRunning ? 'PAUSE' : 'RESUME';
    }
}

/**
 * Initialize the application
 */
function init() {
    // Get DOM elements
    timerDisplay = document.getElementById('timer');
    startBtn = document.getElementById('startBtn');
    stopBtn = document.getElementById('stopBtn');
    statusDiv = document.getElementById('status');
    profileGrid = document.getElementById('profileGrid');
    increaseTimeBtn = document.getElementById('increaseTime');
    decreaseTimeBtn = document.getElementById('decreaseTime');
    volumeSlider = document.getElementById('volumeSlider');

    // Initialize UI modules
    initStatus(statusDiv);
    initVolume();

    // Request notification permission
    requestNotificationPermission();

    // Initialize profile picker
    initProfilePicker(profileGrid, (profile) => {
        setProfile(profile);
        const profileName = profile.name;
        updateStatus(`Profile changed to: ${profileName}`, true);
    });

    // Set initial status
    const currentProfile = getCurrentProfile();
    updateStatus(`Selected: ${currentProfile.name} - Click START to begin`, false);

    // Initialize display
    updateTimerDisplay();

    // Update time button states based on timer state
    const updateTimeButtonsState = () => {
        const { isRunning } = getTimerState();
        if (increaseTimeBtn) increaseTimeBtn.disabled = isRunning;
        if (decreaseTimeBtn) decreaseTimeBtn.disabled = isRunning;

        // Also disable preset buttons when running
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => btn.disabled = isRunning);
    };

    // Event Listeners
    startBtn.addEventListener('click', () => {
        const { isRunning } = getTimerState();

        if (isRunning) {
            const result = pauseTimer();
            if (result) {
                startBtn.textContent = result.text;
            }
        } else {
            const result = startTimer(updateTimerDisplay);
            if (result) {
                startBtn.textContent = result.text;
                stopBtn.disabled = false;
            }
        }
        updateTimeButtonsState();
    });

    stopBtn.addEventListener('click', () => {
        const result = stopTimer(updateTimerDisplay);
        if (result) {
            startBtn.textContent = result.text;
            stopBtn.disabled = result.disabled;
        }
        updateStatus(CONFIG.MESSAGES.READY, false);
        updateTimeButtonsState();
    });

    // Time adjustment buttons
    if (increaseTimeBtn) {
        increaseTimeBtn.addEventListener('click', () => {
            const { isRunning, minutes, seconds } = getTimerState();
            if (isRunning) return; // Don't allow changes while running

            setTimerValues(minutes + CONFIG.TIMER.TIME_ADJUSTMENT_STEP, seconds);
            updateTimerDisplay();
        });
    }

    if (decreaseTimeBtn) {
        decreaseTimeBtn.addEventListener('click', () => {
            const { isRunning, minutes, seconds } = getTimerState();
            if (isRunning) return; // Don't allow changes while running

            if (minutes >= CONFIG.TIMER.MIN_TIMER_MINUTES) {
                setTimerValues(minutes - CONFIG.TIMER.TIME_ADJUSTMENT_STEP, seconds);
                updateTimerDisplay();
            }
        });
    }

    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            setMasterVolume(parseInt(e.target.value));
        });
    }

    // Set initial time button states
    updateTimeButtonsState();

    // Preset timer buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const { isRunning } = getTimerState();
            if (isRunning) return; // Don't allow changes while running

            const minutes = parseInt(btn.getAttribute('data-minutes'));
            setTimerValues(minutes, 0);
            updateTimerDisplay();
            updateStatus(`Timer set to ${minutes} minutes`, true);
            setTimeout(() => {
                const currentProfile = getCurrentProfile();
                updateStatus(`Selected: ${currentProfile.name} - Click START to begin`, false);
            }, 2000);
        });
    });

    // Initialize keyboard shortcuts
    initKeyboardShortcuts({
        onStartPause: () => {
            startBtn.click();
        },
        onReset: () => {
            if (!stopBtn.disabled) {
                stopBtn.click();
            }
        },
        onIncreaseTime: () => {
            if (increaseTimeBtn && !increaseTimeBtn.disabled) {
                increaseTimeBtn.click();
            }
        },
        onDecreaseTime: () => {
            if (decreaseTimeBtn && !decreaseTimeBtn.disabled) {
                decreaseTimeBtn.click();
            }
        },
        onSelectProfile: (index) => {
            selectProfileByIndex(index);
        }
    });

    // Register service worker for PWA support (production only)
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.warn('Service Worker registration failed:', error);
            });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
