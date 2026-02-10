/* ============================================
   CONFIGURATION - Constants & Settings
   ============================================ */

export const CONFIG = {
    // Timer defaults
    TIMER: {
        DEFAULT_MINUTES: 25,
        DEFAULT_SECONDS: 0,
        BREAK_MINUTES: 5,          // Break duration
        LONG_BREAK_MINUTES: 15,    // Long break after 4 sessions
        TIME_ADJUSTMENT_STEP: 5,   // Minutes to add/subtract with +/- buttons
        MIN_TIMER_MINUTES: 5,      // Minimum timer duration
        STATUS_RESET_DELAY: 3000,  // Delay before resetting status (ms)
        MAX_LOG_ENTRIES: 100,
        SESSIONS_BEFORE_LONG_BREAK: 4  // Number of work sessions before long break
    },

    // Audio settings
    AUDIO: {
        // Prime number intervals for phasing (in beats)
        PHASE_INTERVALS: [7, 11, 13, 17],

        // Scale optimized for ambient focus sound
        NOTES: ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4', 'A4'],

        // Loop intervals (Tone.js time notation)
        PAD_LOOP_INTERVAL: '7n',
        MODULAR_LOOP_INTERVAL: '8n',

        // Trigger probabilities
        PAD_TRIGGER_PROBABILITY: 0.6,
        MODULAR_TRIGGER_PROBABILITY: 0.4,

        // Volume levels (in dB)
        PAD_VOLUME: -14,
        MODULAR_VOLUME: -20,
        NOISE_VOLUME: -58,
        LIMITER_THRESHOLD: -2,

        // Filter settings
        HIGH_PASS_FREQUENCY: 100,
        LOW_PASS_FREQUENCY: 2000,

        // Effect settings
        REVERB: {
            decay: 8,
            preDelay: 0.1,
            wet: 0.3
        },
        DELAY: {
            delayTime: '8n.',
            feedback: 0.15,
            wet: 0.25
        },

        // Synth envelopes
        PAD_ENVELOPE: {
            attack: 2,
            decay: 3,
            sustain: 0.5,
            release: 4
        },
        MODULAR_ENVELOPE: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0,
            release: 0.3
        }
    },

    // UI messages
    MESSAGES: {
        READY: 'Click START to begin focus session with infinite generative sound',
        MUSIC_ACTIVE: '♪ Generative sound active - Prime number phasing',
        MUSIC_PAUSED: 'Sound paused',
        MUSIC_STOPPED: 'Sound stopped',
        SESSION_COMPLETE: '🎯 Focus session complete!',
        BREAK_READY: '☕ Break time! Click START to begin break',
        BREAK_COMPLETE: '✨ Break complete! Ready for next focus session',
        LONG_BREAK_READY: '🌟 Time for a long break! You earned it'
    }
};
