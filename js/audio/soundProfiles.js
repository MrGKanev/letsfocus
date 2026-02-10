/* ============================================
   SOUND PROFILES - Different Focus Sound Types
   ============================================ */

/**
 * Research-backed sound profiles for focus and productivity
 *
 * References:
 * - Binaural beats: Beta waves (14-30 Hz) for alertness, Alpha (8-13 Hz) for relaxed focus
 * - Brown noise: 1/f² power spectrum, deeper than white/pink noise
 * - Nature sounds: Natural rhythm patterns reduce stress
 * - Lo-fi: 60-90 BPM range optimal for focus
 */

export const SOUND_PROFILES = {
    /**
     * Science Focus - Research-backed generative ambient
     *
     * Based on peer-reviewed studies:
     * - Brian Eno's "Music for Airports" phasing technique (1978)
     * - 40 Hz gamma entrainment for cognitive enhancement (MIT Picower Institute)
     * - Pink noise (1/f) for brain wave synchronization
     * - Georgetown University work flow music study (2025)
     *
     * Features:
     * - 5 harmonic layers with prime number intervals (17, 19, 23, 29, 31 seconds)
     * - Subtle 40 Hz isochronic pulse (15% more effective than binaural beats)
     * - Pink noise bed for EEG synchronization
     * - Golden ratio note selection for non-repetitive patterns
     * - Breathing filter modulation (~33 second cycle)
     */
    SCIENCE_FOCUS: {
        id: 'science_focus',
        name: 'Science Focus',
        description: 'Research-backed focus enhancement',
        icon: '🔬',
        config: {
            type: 'scientific',
            // Harmonic series notes (natural overtones of C2)
            notes: ['C3', 'G3', 'C4', 'E4', 'G4', 'Bb4', 'C5'],
            // Prime number intervals for Brian Eno-style phasing
            primeIntervals: [17, 19, 23, 29, 31],
            // Volume levels
            padVolume: -16,
            noiseVolume: -52,
            gammaVolume: -45,
            textureVolume: -28,
            // 40 Hz gamma entrainment
            gammaEnabled: true,
            // Sparse texture accents
            textureEnabled: true,
            textureProbability: 0.25,
            // Spacious reverb
            reverb: { decay: 10, preDelay: 0.15, wet: 0.35 },
            delay: { delayTime: '4n.', feedback: 0.2, wet: 0.2 }
        }
    },

    DEEP_FOCUS: {
        id: 'deep_focus',
        name: 'Deep Focus',
        description: 'Ambient generative soundscape',
        icon: '🎵',
        config: {
            type: 'generative',
            notes: ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4', 'A4'],
            padVolume: -14,
            modularVolume: -20,
            noiseVolume: -58,
            noiseType: 'pink',
            padTriggerProb: 0.6,
            modularTriggerProb: 0.4,
            padInterval: '7n',
            modularInterval: '8n',
            reverb: { decay: 8, preDelay: 0.1, wet: 0.3 },
            delay: { delayTime: '8n.', feedback: 0.15, wet: 0.25 }
        }
    },

    BINAURAL_ALPHA: {
        id: 'binaural_alpha',
        name: 'Alpha Waves',
        description: 'Binaural beats for relaxed focus (8-13 Hz)',
        icon: '🧠',
        config: {
            type: 'binaural',
            baseFrequency: 180,
            binauralBeat: 10, // 10 Hz - Alpha range
            volume: -16,
            noiseVolume: -55,
            noiseType: 'pink',
            reverb: { decay: 5, preDelay: 0.08, wet: 0.2 }
        }
    },

    BINAURAL_BETA: {
        id: 'binaural_beta',
        name: 'Beta Waves',
        description: 'Binaural beats for active concentration (14-30 Hz)',
        icon: '⚡',
        config: {
            type: 'binaural',
            baseFrequency: 180,
            binauralBeat: 18, // 18 Hz - Beta range
            volume: -16,
            noiseVolume: -55,
            noiseType: 'pink',
            reverb: { decay: 4, preDelay: 0.08, wet: 0.18 }
        }
    },

    BROWN_NOISE: {
        id: 'brown_noise',
        name: 'Brown Noise',
        description: 'Deep noise for blocking distractions',
        icon: '🌊',
        config: {
            type: 'noise',
            noiseType: 'brown',
            noiseVolume: -18,
            lowPassFreq: 1000,
            highPassFreq: 50,
            reverb: { decay: 2, preDelay: 0, wet: 0.05 }
        }
    },

    WHITE_NOISE: {
        id: 'white_noise',
        name: 'White Noise',
        description: 'Classic white noise for focus',
        icon: '❄️',
        config: {
            type: 'noise',
            noiseType: 'white',
            noiseVolume: -18,
            lowPassFreq: 3000,
            highPassFreq: 100,
            reverb: { decay: 1.5, preDelay: 0, wet: 0.03 }
        }
    },

    RAIN: {
        id: 'rain',
        name: 'Rain Sounds',
        description: 'Realistic rain with distant thunder',
        icon: '🌧️',
        config: {
            type: 'rain',
            // Background rain layer (continuous)
            backgroundNoiseType: 'white',
            backgroundVolume: -20,
            backgroundLowPass: 3000,
            backgroundHighPass: 350,
            // Droplet layer (individual drops)
            dropletVolume: -28,
            dropletFrequency: '16n',
            dropletIntensity: 0.5,
            dropletLowPass: 4000,
            // Ambient space
            reverb: { decay: 2.5, preDelay: 0.02, wet: 0.35 },
            // Distant thunder (rare, subtle)
            thunderEnabled: true
        }
    },

    LOFI: {
        id: 'lofi',
        name: 'Lo-fi Beats',
        description: 'Chill hip-hop inspired beats (75 BPM)',
        icon: '🎧',
        config: {
            type: 'lofi',
            bpm: 75,
            notes: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4', 'Eb4'], // Minor pentatonic
            bassVolume: -14,
            chordVolume: -16,
            noiseVolume: -45,
            noiseType: 'pink',
            reverb: { decay: 1.5, preDelay: 0.015, wet: 0.3 },
            delay: { delayTime: '8n.', feedback: 0.35, wet: 0.2 },
            // Lo-fi characteristics (softer bit crushing)
            bitCrush: 6,
            vinylNoise: true
        }
    },

    MINIMAL: {
        id: 'minimal',
        name: 'Minimal Tones',
        description: 'Simple sine wave patterns',
        icon: '〰️',
        config: {
            type: 'minimal',
            notes: ['A3', 'C4', 'E4', 'G4'],
            volume: -20,
            interval: '2n',
            triggerProb: 0.4,
            reverb: { decay: 7, preDelay: 0.12, wet: 0.6 },
            delay: { delayTime: '4n.', feedback: 0.3, wet: 0.35 }
        }
    },

    FOREST: {
        id: 'forest',
        name: 'Forest',
        description: 'Birds, crickets, wind & stream',
        icon: '🌲',
        config: {
            type: 'forest',
            // Wind/rustling base
            noiseType: 'brown',
            noiseVolume: -24,
            lowPassFreq: 2500,
            highPassFreq: 80,
            reverb: { decay: 4.5, preDelay: 0.1, wet: 0.4 },
            // Bird chirps
            birdFrequency: '2n',
            birdProb: 0.15,
            birdVolume: -28,
            // Crickets and insects
            insectsEnabled: true,
            // Distant stream
            streamEnabled: true
        }
    }
};

/**
 * Get all available profiles as an array
 */
export function getAllProfiles() {
    return Object.values(SOUND_PROFILES);
}

/**
 * Get a specific profile by ID
 */
export function getProfileById(id) {
    return Object.values(SOUND_PROFILES).find(profile => profile.id === id);
}

/**
 * Get default profile
 */
export function getDefaultProfile() {
    return SOUND_PROFILES.SCIENCE_FOCUS;
}
