/* ============================================
   PROFILE ENGINE - Sound Profile Implementation
   ============================================ */

import * as Tone from 'tone';

let currentEngine = null;
let audioInitialized = false;

/**
 * Initialize audio context with error handling
 */
export async function initProfileEngine() {
    if (audioInitialized) return true;
    try {
        await Tone.start();
        audioInitialized = true;
        return true;
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
        return false;
    }
}

/**
 * Create master audio chain with configurable options
 * Eliminates code duplication across all engine classes
 */
async function createMasterChain(options = {}) {
    const {
        reverb = 1.5,
        delay = null,
        highPass = null,
        lowPass = null,
        bitCrush = null,
        limiterThreshold = -2
    } = options;

    const components = [];
    let outputNode;

    // Limiter always at the end
    const limiter = new Tone.Limiter(limiterThreshold).toDestination();
    components.push(limiter);
    outputNode = limiter;

    // Filters (optional)
    if (highPass) {
        const highPassFilter = new Tone.Filter(highPass, 'highpass').connect(outputNode);
        components.push(highPassFilter);
        outputNode = highPassFilter;
    }
    if (lowPass) {
        const lowPassFilter = new Tone.Filter(lowPass, 'lowpass').connect(outputNode);
        components.push(lowPassFilter);
        outputNode = lowPassFilter;
    }

    // BitCrusher for lo-fi effects (optional)
    if (bitCrush) {
        const bitCrusher = new Tone.BitCrusher(bitCrush).connect(outputNode);
        components.push(bitCrusher);
        outputNode = bitCrusher;
    }

    // Reverb
    const reverbNode = new Tone.Reverb(reverb).connect(outputNode);
    await reverbNode.generate();
    components.push(reverbNode);
    outputNode = reverbNode;

    // Delay (optional)
    let delayNode = null;
    if (delay) {
        delayNode = new Tone.PingPongDelay(delay).connect(reverbNode);
        components.push(delayNode);
        outputNode = delayNode;
    }

    return {
        components,
        connect: outputNode,
        limiter,
        reverb: reverbNode,
        delay: delayNode
    };
}

/**
 * Base class for all sound engines
 */
class SoundEngine {
    constructor(config) {
        this.config = config;
        this.components = [];
        this.loops = [];
    }

    async start() {
        throw new Error('Must implement start()');
    }

    stop() {
        this.loops.forEach(loop => {
            if (loop) {
                loop.stop();
                loop.cancel();
            }
        });
        this.components.forEach(comp => {
            if (comp?.releaseAll) comp.releaseAll();
            if (comp?.stop) comp.stop();
        });
    }

    dispose() {
        this.stop();
        this.loops = [];
        this.components.forEach(comp => {
            if (comp?.dispose) comp.dispose();
        });
        this.components = [];
    }
}

/**
 * Generative ambient engine (Deep Focus)
 */
class GenerativeEngine extends SoundEngine {
    async start() {
        const { config } = this;
        const chain = await createMasterChain({
            reverb: config.reverb,
            delay: config.delay,
            highPass: 100,
            lowPass: 2000
        });
        this.components.push(...chain.components);

        // Pad synth
        const padSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 2, decay: 3, sustain: 0.5, release: 4 }
        }).connect(chain.connect);
        padSynth.volume.value = config.padVolume;

        // Modular synth
        const modSynth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 3,
            envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 }
        }).connect(chain.reverb);
        modSynth.volume.value = config.modularVolume;

        // Noise
        const noise = new Tone.Noise(config.noiseType).connect(chain.reverb);
        noise.volume.value = config.noiseVolume;
        noise.start();

        this.components.push(padSynth, modSynth, noise);

        // Create loops
        const padLoop = new Tone.Loop((time) => {
            if (Math.random() < config.padTriggerProb) {
                const note = config.notes[Math.floor(Math.random() * config.notes.length)];
                padSynth.triggerAttackRelease(note, '1n', time);
            }
        }, config.padInterval);
        padLoop.start(0);
        this.loops.push(padLoop);

        const modLoop = new Tone.Loop((time) => {
            if (Math.random() < config.modularTriggerProb) {
                const note = config.notes[Math.floor(Math.random() * config.notes.length)];
                const octaveNote = Tone.Frequency(note).transpose(12);
                modSynth.triggerAttackRelease(octaveNote, '32n', time);
            }
        }, config.modularInterval);
        modLoop.start(0);
        this.loops.push(modLoop);
    }
}

/**
 * Enhanced Binaural beats engine
 * - Warmer carrier tone with subtle harmonics
 * - Organic frequency drift for natural feel
 * - Multiple carrier layers for richer sound
 */
class BinauralEngine extends SoundEngine {
    async start() {
        const { config } = this;
        const chain = await createMasterChain({
            reverb: config.reverb,
            lowPass: 800 // Warm, focused sound
        });
        this.components.push(...chain.components);

        // Create stereo panners
        const leftPanner = new Tone.Panner(-0.95).connect(chain.reverb);
        const rightPanner = new Tone.Panner(0.95).connect(chain.reverb);

        // Primary carrier - left ear
        const leftOsc = new Tone.Oscillator(config.baseFrequency, 'sine').connect(leftPanner);
        leftOsc.volume.value = config.volume;
        leftOsc.start();

        // Primary carrier - right ear (with binaural offset)
        const rightOsc = new Tone.Oscillator(config.baseFrequency + config.binauralBeat, 'sine').connect(rightPanner);
        rightOsc.volume.value = config.volume;
        rightOsc.start();

        // Secondary harmonic layer (octave below, subtle)
        const leftSubOsc = new Tone.Oscillator(config.baseFrequency / 2, 'sine').connect(leftPanner);
        leftSubOsc.volume.value = config.volume - 12;
        leftSubOsc.start();

        const rightSubOsc = new Tone.Oscillator((config.baseFrequency + config.binauralBeat) / 2, 'sine').connect(rightPanner);
        rightSubOsc.volume.value = config.volume - 12;
        rightSubOsc.start();

        // Organic frequency drift (very slow, subtle)
        const driftLFO = new Tone.LFO(0.02, -1, 1); // ~50 second cycle
        driftLFO.start();
        const driftGain = new Tone.Gain(0.5); // ±0.5 Hz drift
        driftLFO.connect(driftGain);
        driftGain.connect(leftOsc.frequency);
        driftGain.connect(rightOsc.frequency);

        // Background texture (filtered pink noise)
        const noiseFilter = new Tone.Filter(400, 'lowpass').connect(chain.reverb);
        const noise = new Tone.Noise(config.noiseType || 'pink').connect(noiseFilter);
        noise.volume.value = config.noiseVolume;
        noise.start();

        // Breathing modulation on noise
        const breathLFO = new Tone.LFO(0.08, 300, 500);
        breathLFO.connect(noiseFilter.frequency);
        breathLFO.start();

        this.components.push(
            leftOsc, rightOsc, leftSubOsc, rightSubOsc,
            leftPanner, rightPanner,
            driftLFO, driftGain, breathLFO,
            noise, noiseFilter
        );
    }
}

/**
 * Enhanced Noise engine
 * - Organic breathing modulation
 * - Multiple noise layers for depth
 * - Subtle stereo movement
 */
class NoiseEngine extends SoundEngine {
    async start() {
        const { config } = this;
        const chain = await createMasterChain({
            reverb: config.reverb,
            highPass: config.highPassFreq,
            lowPass: config.lowPassFreq
        });
        this.components.push(...chain.components);

        // Primary noise layer
        const primaryNoise = new Tone.Noise(config.noiseType).connect(chain.reverb);
        primaryNoise.volume.value = config.noiseVolume;
        primaryNoise.start();

        // Secondary texture layer (different noise type, quieter)
        const secondaryType = config.noiseType === 'brown' ? 'pink' : 'brown';
        const secondaryFilter = new Tone.Filter(config.lowPassFreq * 0.6, 'lowpass').connect(chain.reverb);
        const secondaryNoise = new Tone.Noise(secondaryType).connect(secondaryFilter);
        secondaryNoise.volume.value = config.noiseVolume - 8;
        secondaryNoise.start();

        // Breathing modulation (very slow filter sweep)
        const breathFilter = new Tone.Filter(config.lowPassFreq, 'lowpass').connect(chain.limiter);
        const breathLFO = new Tone.LFO(0.04, config.lowPassFreq * 0.7, config.lowPassFreq * 1.1);
        breathLFO.connect(breathFilter.frequency);
        breathLFO.start();

        // Reconnect primary through breath filter
        primaryNoise.disconnect();
        primaryNoise.connect(breathFilter);

        // Subtle stereo widening with auto-pan
        const autoPan = new Tone.AutoPanner({
            frequency: 0.03,
            depth: 0.15
        }).connect(chain.reverb);
        autoPan.start();

        // Third layer through stereo widener
        const wideNoise = new Tone.Noise(config.noiseType).connect(autoPan);
        wideNoise.volume.value = config.noiseVolume - 6;
        wideNoise.start();

        this.components.push(
            primaryNoise, secondaryNoise, wideNoise,
            secondaryFilter, breathFilter, breathLFO, autoPan
        );
    }
}

/**
 * Enhanced Realistic Rain Engine
 * - Multiple rain layers (close, medium, distant)
 * - Variable droplet sizes and surfaces
 * - Distant thunder rumbles
 * - Dynamic intensity variation
 */
class RainEngine extends SoundEngine {
    async start() {
        const { config } = this;
        const chain = await createMasterChain({ reverb: config.reverb });
        this.components.push(...chain.components);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 1: Distant rain (low frequency wash)
        // ═══════════════════════════════════════════════════════════════
        const distantFilter = new Tone.Filter(800, 'lowpass').connect(chain.reverb);
        const distantNoise = new Tone.Noise('brown').connect(distantFilter);
        distantNoise.volume.value = config.backgroundVolume - 4;
        distantNoise.start();

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2: Close rain (main layer with wind modulation)
        // ═══════════════════════════════════════════════════════════════
        const closeHighPass = new Tone.Filter(config.backgroundHighPass, 'highpass').connect(chain.reverb);
        const closeLowPass = new Tone.Filter(config.backgroundLowPass, 'lowpass').connect(closeHighPass);
        const closeNoise = new Tone.Noise(config.backgroundNoiseType).connect(closeLowPass);
        closeNoise.volume.value = config.backgroundVolume;
        closeNoise.start();

        // Wind modulation (multiple speeds for realism)
        const windLFO1 = new Tone.LFO(0.03, config.backgroundLowPass * 0.7, config.backgroundLowPass * 1.1);
        const windLFO2 = new Tone.LFO(0.08, config.backgroundLowPass * 0.9, config.backgroundLowPass * 1.05);
        windLFO1.connect(closeLowPass.frequency);
        windLFO2.connect(closeLowPass.frequency);
        windLFO1.start();
        windLFO2.start();

        this.components.push(
            distantNoise, distantFilter,
            closeNoise, closeLowPass, closeHighPass,
            windLFO1, windLFO2
        );

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3: Small droplets (high frequency, frequent)
        // ═══════════════════════════════════════════════════════════════
        const smallDropFilter = new Tone.Filter(6000, 'lowpass').connect(chain.reverb);
        const smallDropSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.015, sustain: 0, release: 0.02 }
        }).connect(smallDropFilter);
        smallDropSynth.volume.value = config.dropletVolume - 2;

        const smallDropLoop = new Tone.Loop((time) => {
            if (Math.random() < config.dropletIntensity * 1.2) {
                smallDropSynth.triggerAttackRelease('128n', time);
            }
        }, '32n');
        smallDropLoop.start(0);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 4: Medium droplets (surface impacts)
        // ═══════════════════════════════════════════════════════════════
        const medDropFilter = new Tone.Filter(3500, 'lowpass').connect(chain.reverb);
        const medDropSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.002, decay: 0.03, sustain: 0, release: 0.04 }
        }).connect(medDropFilter);
        medDropSynth.volume.value = config.dropletVolume;

        const medDropLoop = new Tone.Loop((time) => {
            if (Math.random() < config.dropletIntensity) {
                medDropSynth.triggerAttackRelease('64n', time);
            }
        }, config.dropletFrequency);
        medDropLoop.start(0);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 5: Large drops (roof/puddle impacts, sparse)
        // ═══════════════════════════════════════════════════════════════
        const largeDropFilter = new Tone.Filter(2000, 'lowpass').connect(chain.reverb);
        const largeDropSynth = new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.1 }
        }).connect(largeDropFilter);
        largeDropSynth.volume.value = config.dropletVolume + 2;

        const largeDropLoop = new Tone.Loop((time) => {
            if (Math.random() < config.dropletIntensity * 0.3) {
                largeDropSynth.triggerAttackRelease('32n', time);
            }
        }, '4n');
        largeDropLoop.start(0);

        this.loops.push(smallDropLoop, medDropLoop, largeDropLoop);
        this.components.push(
            smallDropSynth, smallDropFilter,
            medDropSynth, medDropFilter,
            largeDropSynth, largeDropFilter
        );

        // ═══════════════════════════════════════════════════════════════
        // LAYER 6: Distant thunder (very rare, subtle)
        // ═══════════════════════════════════════════════════════════════
        if (config.thunderEnabled !== false) {
            const thunderFilter = new Tone.Filter(200, 'lowpass').connect(chain.reverb);
            const thunderReverb = new Tone.Reverb({ decay: 4, wet: 0.8 }).connect(thunderFilter);
            await thunderReverb.generate();

            const thunderSynth = new Tone.NoiseSynth({
                noise: { type: 'brown' },
                envelope: { attack: 0.3, decay: 2.5, sustain: 0.1, release: 3 }
            }).connect(thunderReverb);
            thunderSynth.volume.value = -18;

            // Thunder every 45-90 seconds (prime-ish interval)
            const thunderLoop = new Tone.Loop((time) => {
                if (Math.random() < 0.4) { // 40% chance when loop fires
                    thunderSynth.triggerAttackRelease('2n', time);
                }
            }, 47); // Prime number for variation
            thunderLoop.start(30); // First thunder after 30 seconds

            this.loops.push(thunderLoop);
            this.components.push(thunderSynth, thunderReverb, thunderFilter);
        }
    }
}

/**
 * Enhanced Forest Ambience Engine
 * - Multiple bird species with different calls
 * - Crickets and insects
 * - Wind gusts through leaves
 * - Distant stream/water
 * - Depth layers (close, medium, far)
 */
class ForestEngine extends SoundEngine {
    async start() {
        const { config } = this;
        const chain = await createMasterChain({
            reverb: config.reverb,
            highPass: config.highPassFreq,
            lowPass: config.lowPassFreq
        });
        this.components.push(...chain.components);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 1: Base wind through trees (modulated brown noise)
        // ═══════════════════════════════════════════════════════════════
        const windFilter = new Tone.Filter(1200, 'lowpass').connect(chain.reverb);
        const windNoise = new Tone.Noise(config.noiseType).connect(windFilter);
        windNoise.volume.value = config.noiseVolume;
        windNoise.start();

        // Wind gusts (slow filter modulation)
        const gustLFO1 = new Tone.LFO(0.05, 600, 1400);
        const gustLFO2 = new Tone.LFO(0.02, 800, 1600);
        gustLFO1.connect(windFilter.frequency);
        gustLFO2.connect(windFilter.frequency);
        gustLFO1.start();
        gustLFO2.start();

        this.components.push(windNoise, windFilter, gustLFO1, gustLFO2);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2: Leaves rustling (high frequency bursts)
        // ═══════════════════════════════════════════════════════════════
        const leavesFilter = new Tone.Filter(4000, 'highpass').connect(chain.reverb);
        const leavesNoise = new Tone.Noise('white').connect(leavesFilter);
        leavesNoise.volume.value = config.noiseVolume - 10;
        leavesNoise.start();

        // Rustle intensity varies with wind
        const rustleLFO = new Tone.LFO(0.08, -20, -8);
        rustleLFO.connect(leavesNoise.volume);
        rustleLFO.start();

        this.components.push(leavesNoise, leavesFilter, rustleLFO);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3: Small songbirds (high pitched, frequent)
        // ═══════════════════════════════════════════════════════════════
        const smallBirdSynth = new Tone.FMSynth({
            harmonicity: 4,
            modulationIndex: 15,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.003, decay: 0.04, sustain: 0, release: 0.03 },
            modulation: { type: 'sine' },
            modulationEnvelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 }
        }).connect(chain.reverb);
        smallBirdSynth.volume.value = config.birdVolume;

        const smallBirdLoop = new Tone.Loop((time) => {
            if (Math.random() < config.birdProb * 1.5) {
                // High pitched songbird (2000-4000 Hz)
                const freq = 2000 + Math.random() * 2000;
                // Sometimes do a quick trill (2-3 notes)
                if (Math.random() < 0.3) {
                    smallBirdSynth.triggerAttackRelease(freq, '64n', time);
                    smallBirdSynth.triggerAttackRelease(freq * 1.1, '64n', time + 0.05);
                    smallBirdSynth.triggerAttackRelease(freq * 0.95, '64n', time + 0.1);
                } else {
                    smallBirdSynth.triggerAttackRelease(freq, '32n', time);
                }
            }
        }, '2n');
        smallBirdLoop.start(2);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 4: Larger birds (lower, slower calls)
        // ═══════════════════════════════════════════════════════════════
        const largeBirdSynth = new Tone.FMSynth({
            harmonicity: 2.5,
            modulationIndex: 8,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 },
            modulation: { type: 'sine' },
            modulationEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.05, release: 0.1 }
        }).connect(chain.reverb);
        largeBirdSynth.volume.value = config.birdVolume - 4;

        const largeBirdLoop = new Tone.Loop((time) => {
            if (Math.random() < config.birdProb * 0.4) {
                // Lower bird call (800-1500 Hz)
                const freq = 800 + Math.random() * 700;
                largeBirdSynth.triggerAttackRelease(freq, '8n', time);
                // Sometimes a response call
                if (Math.random() < 0.4) {
                    largeBirdSynth.triggerAttackRelease(freq * 1.05, '8n', time + 0.4);
                }
            }
        }, 4); // Every 4 seconds
        largeBirdLoop.start(5);

        this.loops.push(smallBirdLoop, largeBirdLoop);
        this.components.push(smallBirdSynth, largeBirdSynth);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 5: Crickets/Insects (continuous high frequency)
        // ═══════════════════════════════════════════════════════════════
        if (config.insectsEnabled !== false) {
            // Cricket base tone (amplitude modulated)
            const cricketOsc = new Tone.Oscillator(4200, 'sine');
            const cricketTremolo = new Tone.Tremolo(18, 0.9).connect(chain.reverb);
            cricketTremolo.start();
            cricketOsc.connect(cricketTremolo);
            cricketOsc.volume.value = -38;
            cricketOsc.start();

            // Second cricket at slightly different frequency
            const cricket2Osc = new Tone.Oscillator(3800, 'sine');
            const cricket2Tremolo = new Tone.Tremolo(15, 0.85).connect(chain.reverb);
            cricket2Tremolo.start();
            cricket2Osc.connect(cricket2Tremolo);
            cricket2Osc.volume.value = -40;
            cricket2Osc.start();

            this.components.push(cricketOsc, cricketTremolo, cricket2Osc, cricket2Tremolo);
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 6: Distant stream (optional, subtle)
        // ═══════════════════════════════════════════════════════════════
        if (config.streamEnabled !== false) {
            const streamFilter = new Tone.Filter(2500, 'bandpass').connect(chain.reverb);
            const streamNoise = new Tone.Noise('white').connect(streamFilter);
            streamNoise.volume.value = -35;
            streamNoise.start();

            // Subtle babbling variation
            const streamLFO = new Tone.LFO(0.15, 1800, 3000);
            streamLFO.connect(streamFilter.frequency);
            streamLFO.start();

            this.components.push(streamNoise, streamFilter, streamLFO);
        }
    }
}

/**
 * Enhanced Lo-fi Beats Engine
 * - Authentic vinyl crackle with random pops
 * - Tape wobble/flutter effect
 * - Rhodes-like electric piano sound
 * - Jazzy 7th chords
 * - Sidechain-style ducking
 */
class LofiEngine extends SoundEngine {
    async start() {
        const { config } = this;

        // Set tempo for this profile
        Tone.Transport.bpm.value = config.bpm;

        const chain = await createMasterChain({
            reverb: config.reverb,
            delay: config.delay,
            bitCrush: config.bitCrush,
            lowPass: 3500 // Warm, filtered sound
        });
        this.components.push(...chain.components);

        // ═══════════════════════════════════════════════════════════════
        // TAPE WOBBLE: Subtle pitch/filter modulation for authentic feel
        // ═══════════════════════════════════════════════════════════════
        const wobbleFilter = new Tone.Filter(3000, 'lowpass').connect(chain.connect);
        const wobbleLFO = new Tone.LFO({
            frequency: 0.3,
            min: 2800,
            max: 3200,
            type: 'sine'
        });
        wobbleLFO.connect(wobbleFilter.frequency);
        wobbleLFO.start();

        this.components.push(wobbleFilter, wobbleLFO);

        // ═══════════════════════════════════════════════════════════════
        // RHODES-LIKE KEYS: FM synthesis for electric piano character
        // ═══════════════════════════════════════════════════════════════
        const keys = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3.01, // Slightly detuned for warmth
            modulationIndex: 1.5,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.8, sustain: 0.3, release: 1.5 },
            modulation: { type: 'triangle' },
            modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.8 }
        }).connect(wobbleFilter);
        keys.volume.value = config.chordVolume;

        // ═══════════════════════════════════════════════════════════════
        // BASS: Warm sub bass with slight saturation feel
        // ═══════════════════════════════════════════════════════════════
        const bass = new Tone.MonoSynth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
            filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5, baseFrequency: 200, octaves: 2 }
        }).connect(chain.connect);
        bass.volume.value = config.bassVolume;

        this.components.push(keys, bass);

        // ═══════════════════════════════════════════════════════════════
        // VINYL NOISE: Continuous with random crackles/pops
        // ═══════════════════════════════════════════════════════════════
        // Base vinyl hiss
        const vinylFilter = new Tone.Filter(2000, 'highpass').connect(chain.reverb);
        const vinylNoise = new Tone.Noise('white').connect(vinylFilter);
        vinylNoise.volume.value = config.noiseVolume;
        vinylNoise.start();

        // Random vinyl pops/crackles
        const popSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.01 }
        }).connect(chain.reverb);
        popSynth.volume.value = config.noiseVolume + 5;

        const popLoop = new Tone.Loop((time) => {
            // Random pops (more frequent = more worn vinyl feel)
            if (Math.random() < 0.15) {
                popSynth.triggerAttackRelease('128n', time);
            }
            // Occasional louder click
            if (Math.random() < 0.03) {
                popSynth.volume.value = config.noiseVolume + 12;
                popSynth.triggerAttackRelease('64n', time);
                popSynth.volume.value = config.noiseVolume + 5;
            }
        }, '16n');
        popLoop.start(0);

        this.loops.push(popLoop);
        this.components.push(vinylNoise, vinylFilter, popSynth);

        // ═══════════════════════════════════════════════════════════════
        // CHORD PROGRESSION: Jazzy 7ths with variation
        // ═══════════════════════════════════════════════════════════════
        // Jazz chord voicings (7ths, 9ths)
        const chordProgressions = [
            // ii-V-I-VI progression fragments
            [0, 2, 4, 6], // m7
            [1, 3, 5],    // triad
            [0, 2, 4],    // triad
            [0, 3, 5, 6], // maj7
        ];
        let chordIndex = 0;

        const chordLoop = new Tone.Loop((time) => {
            if (Math.random() < 0.75) {
                const progression = chordProgressions[chordIndex % chordProgressions.length];
                const chord = progression.map(i => {
                    const noteIdx = i % config.notes.length;
                    return config.notes[noteIdx];
                });

                // Humanized timing
                const humanize = (Math.random() - 0.5) * 0.02;
                keys.triggerAttackRelease(chord, '2n', time + humanize);
                chordIndex++;
            }
        }, '1m');
        chordLoop.start(0);

        // ═══════════════════════════════════════════════════════════════
        // BASS PATTERN: Syncopated, groove-focused
        // ═══════════════════════════════════════════════════════════════
        let bassPatternIndex = 0;
        const bassPattern = [0, null, 0, null, 0, null, 2, null]; // Syncopated pattern

        const bassLoop = new Tone.Loop((time) => {
            const patternValue = bassPattern[bassPatternIndex % bassPattern.length];
            if (patternValue !== null) {
                const note = config.notes[patternValue % config.notes.length];
                // Drop an octave for sub bass
                const bassNote = Tone.Frequency(note).transpose(-12).toNote();
                bass.triggerAttackRelease(bassNote, '8n', time);
            }
            bassPatternIndex++;
        }, '8n');
        bassLoop.start(0);

        this.loops.push(chordLoop, bassLoop);
    }
}

/**
 * Enhanced Minimal Tones Engine
 * - Rich harmonic overtones
 * - Subtle detuning for warmth
 * - Variable dynamics and timing
 * - Multiple voice layers
 * - Gentle filter movement
 */
class MinimalEngine extends SoundEngine {
    async start() {
        const { config } = this;
        const chain = await createMasterChain({
            reverb: config.reverb,
            delay: config.delay
        });
        this.components.push(...chain.components);

        // ═══════════════════════════════════════════════════════════════
        // MAIN VOICE: Rich sine with subtle harmonics
        // ═══════════════════════════════════════════════════════════════
        const mainSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: {
                attack: config.attack || 0.8,
                decay: 1.5,
                sustain: 0.4,
                release: config.release || 3
            }
        }).connect(chain.connect);
        mainSynth.volume.value = config.volume;

        // ═══════════════════════════════════════════════════════════════
        // HARMONIC VOICE: Octave above, very quiet
        // ═══════════════════════════════════════════════════════════════
        const harmonicSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: {
                attack: (config.attack || 0.8) * 1.2,
                decay: 2,
                sustain: 0.2,
                release: (config.release || 3) * 1.5
            }
        }).connect(chain.reverb);
        harmonicSynth.volume.value = config.volume - 12;

        // ═══════════════════════════════════════════════════════════════
        // SUB VOICE: Octave below, felt more than heard
        // ═══════════════════════════════════════════════════════════════
        const subSynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: (config.attack || 0.8) * 0.8,
                decay: 1,
                sustain: 0.5,
                release: config.release || 3
            }
        }).connect(chain.connect);
        subSynth.volume.value = config.volume - 8;

        this.components.push(mainSynth, harmonicSynth, subSynth);

        // ═══════════════════════════════════════════════════════════════
        // GENTLE FILTER MOVEMENT: Breathing quality
        // ═══════════════════════════════════════════════════════════════
        const breathFilter = new Tone.Filter(4000, 'lowpass').connect(chain.limiter);
        const breathLFO = new Tone.LFO(0.02, 2500, 5000);
        breathLFO.connect(breathFilter.frequency);
        breathLFO.start();

        // Reconnect delay through breathing filter
        if (chain.delay) {
            chain.delay.disconnect();
            chain.delay.connect(breathFilter);
        }

        this.components.push(breathFilter, breathLFO);

        // ═══════════════════════════════════════════════════════════════
        // SPARSE NOTE PATTERN: Variable timing with golden ratio
        // ═══════════════════════════════════════════════════════════════
        const goldenRatio = 1.618033988749;
        let noteIndex = 0;
        let lastNote = null;

        // Main sparse loop
        const mainLoop = new Tone.Loop((time) => {
            if (Math.random() < config.triggerProb) {
                // Use golden ratio for note selection (pleasing, non-repetitive)
                noteIndex = (noteIndex + goldenRatio) % config.notes.length;
                const note = config.notes[Math.floor(noteIndex)];

                // Avoid immediate repetition
                if (note === lastNote && config.notes.length > 1) {
                    noteIndex = (noteIndex + 1) % config.notes.length;
                }
                lastNote = config.notes[Math.floor(noteIndex)];

                // Variable dynamics
                const velocity = 0.4 + Math.random() * 0.3;

                // Humanized timing
                const humanize = (Math.random() - 0.5) * 0.15;

                // Main note
                mainSynth.triggerAttackRelease(lastNote, '1n', time + humanize, velocity);

                // Harmonic (octave up, delayed slightly)
                if (Math.random() < 0.6) {
                    const harmonicNote = Tone.Frequency(lastNote).transpose(12).toNote();
                    harmonicSynth.triggerAttackRelease(harmonicNote, '1n', time + humanize + 0.1, velocity * 0.5);
                }

                // Sub (octave down, occasional)
                if (Math.random() < 0.4) {
                    const subNote = Tone.Frequency(lastNote).transpose(-12).toNote();
                    subSynth.triggerAttackRelease(subNote, '2n', time + humanize, velocity * 0.7);
                }
            }
        }, config.interval);
        mainLoop.start(0);

        // Secondary sparse layer (different interval for phasing)
        const secondaryLoop = new Tone.Loop((time) => {
            if (Math.random() < config.triggerProb * 0.3) {
                const note = config.notes[Math.floor(Math.random() * config.notes.length)];
                const velocity = 0.2 + Math.random() * 0.2;
                mainSynth.triggerAttackRelease(note, '2n', time, velocity);
            }
        }, 7); // Prime number interval for variation
        secondaryLoop.start(3);

        this.loops.push(mainLoop, secondaryLoop);
    }
}

/**
 * Scientific Focus Engine
 *
 * Based on peer-reviewed research:
 * - Brian Eno's "Music for Airports" phasing technique with prime number intervals
 * - 40 Hz gamma isochronic tones for cognitive enhancement (MIT Picower Institute)
 * - Pink noise (1/f) for brain wave synchronization (PubMed: 22726808)
 * - Harmonic series for reduced cognitive load
 *
 * References:
 * - https://reverbmachine.com/blog/deconstructing-brian-eno-music-for-airports/
 * - https://pmc.ncbi.nlm.nih.gov/articles/PMC7683678/ (Gamma entrainment study)
 * - https://pubmed.ncbi.nlm.nih.gov/22726808/ (Pink noise brain synchronization)
 */
class ScientificFocusEngine extends SoundEngine {
    async start() {
        const { config } = this;

        const chain = await createMasterChain({
            reverb: config.reverb,
            delay: config.delay,
            highPass: 80,
            lowPass: 2500
        });
        this.components.push(...chain.components);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 1: Pink Noise Bed (1/f spectrum - brain synchronization)
        // Research: Reduces EEG complexity, synchronizes brain waves
        // ═══════════════════════════════════════════════════════════════
        const pinkNoise = new Tone.Noise('pink').connect(chain.reverb);
        pinkNoise.volume.value = config.noiseVolume;
        pinkNoise.start();
        this.components.push(pinkNoise);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2: 40 Hz Gamma Isochronic Pulse (cognitive enhancement)
        // Research: 15% more effective than binaural beats for focus
        // Very subtle - felt more than heard
        // ═══════════════════════════════════════════════════════════════
        if (config.gammaEnabled !== false) {
            // Create amplitude-modulated 40 Hz pulse
            const gammaCarrier = new Tone.Oscillator(200, 'sine');
            const gammaLFO = new Tone.LFO(40, 0, 1); // 40 Hz modulation
            const gammaGain = new Tone.Gain(0).connect(chain.reverb);

            gammaCarrier.connect(gammaGain);
            gammaLFO.connect(gammaGain.gain);

            gammaCarrier.volume.value = config.gammaVolume || -45;
            gammaCarrier.start();
            gammaLFO.start();

            this.components.push(gammaCarrier, gammaLFO, gammaGain);
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3-7: Brian Eno Phasing Layers
        // Technique: Multiple synths with prime number interval loops
        // Result: Never-repeating patterns (would take days to sync)
        // ═══════════════════════════════════════════════════════════════

        // Prime number intervals in seconds (incommensurable ratios)
        // These will never synchronize, creating infinite variation
        const primeIntervals = config.primeIntervals || [17, 19, 23, 29, 31];

        // Harmonic series notes (more natural than equal temperament)
        // Based on fundamental C2 (65.41 Hz) harmonics
        const harmonicNotes = config.notes || [
            'C3',   // 2nd harmonic
            'G3',   // 3rd harmonic
            'C4',   // 4th harmonic
            'E4',   // 5th harmonic
            'G4',   // 6th harmonic
            'Bb4',  // 7th harmonic (natural minor 7th)
            'C5'    // 8th harmonic
        ];

        // Create multiple pad synths with different timbres
        const padConfigs = [
            { type: 'sine', volume: config.padVolume || -16, attack: 3, release: 5 },
            { type: 'sine', volume: (config.padVolume || -16) - 3, attack: 4, release: 6 },
            { type: 'triangle', volume: (config.padVolume || -16) - 6, attack: 5, release: 8 },
            { type: 'sine', volume: (config.padVolume || -16) - 4, attack: 3.5, release: 7 },
            { type: 'sine', volume: (config.padVolume || -16) - 5, attack: 4.5, release: 6.5 }
        ];

        // Create phasing loops - each with prime number interval
        primeIntervals.forEach((intervalSeconds, index) => {
            const padConfig = padConfigs[index % padConfigs.length];

            const synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: padConfig.type },
                envelope: {
                    attack: padConfig.attack,
                    decay: 2,
                    sustain: 0.4,
                    release: padConfig.release
                }
            }).connect(chain.connect);
            synth.volume.value = padConfig.volume;

            this.components.push(synth);

            // Each loop triggers at its prime interval
            // Note selection uses golden ratio for pleasing distribution
            const goldenRatio = 1.618033988749;
            let noteIndex = index;

            const loop = new Tone.Loop((time) => {
                // Use golden ratio to walk through notes (never obvious pattern)
                noteIndex = (noteIndex + goldenRatio) % harmonicNotes.length;
                const note = harmonicNotes[Math.floor(noteIndex)];

                // Slight random variation in timing for organic feel
                const humanize = (Math.random() - 0.5) * 0.1;

                synth.triggerAttackRelease(
                    note,
                    padConfig.attack + padConfig.release,
                    time + humanize
                );
            }, intervalSeconds);

            loop.start(index * 2); // Stagger start times
            this.loops.push(loop);
        });

        // ═══════════════════════════════════════════════════════════════
        // LAYER 8: Texture accents (sparse FM synthesis)
        // Adds subtle movement without disrupting focus
        // ═══════════════════════════════════════════════════════════════
        if (config.textureEnabled !== false) {
            const textureSynth = new Tone.FMSynth({
                harmonicity: 2,
                modulationIndex: 1.5,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.5, decay: 1, sustain: 0, release: 2 },
                modulation: { type: 'sine' },
                modulationEnvelope: { attack: 0.2, decay: 0.5, sustain: 0, release: 1 }
            }).connect(chain.reverb);
            textureSynth.volume.value = config.textureVolume || -28;

            this.components.push(textureSynth);

            // Very sparse texture - prime number interval (37 seconds)
            const textureLoop = new Tone.Loop((time) => {
                if (Math.random() < (config.textureProbability || 0.3)) {
                    const note = harmonicNotes[Math.floor(Math.random() * harmonicNotes.length)];
                    const octaveUp = Tone.Frequency(note).transpose(12);
                    textureSynth.triggerAttackRelease(octaveUp, '2n', time);
                }
            }, 37); // Prime number for maximum phase variation

            textureLoop.start(5);
            this.loops.push(textureLoop);
        }

        // ═══════════════════════════════════════════════════════════════
        // BREATHING: Very slow LFO on master filter for organic movement
        // Mimics natural rhythms (respiration ~0.25 Hz)
        // ═══════════════════════════════════════════════════════════════
        const breathingLFO = new Tone.LFO(0.03, 1800, 2200); // ~33 second cycle
        const breathingFilter = new Tone.Filter(2000, 'lowpass').connect(chain.limiter);
        breathingLFO.connect(breathingFilter.frequency);
        breathingLFO.start();

        // Reconnect reverb through breathing filter
        chain.reverb.disconnect();
        chain.reverb.connect(breathingFilter);

        this.components.push(breathingLFO, breathingFilter);
    }
}

// Engine type registry
const ENGINE_TYPES = {
    generative: GenerativeEngine,
    scientific: ScientificFocusEngine,
    binaural: BinauralEngine,
    noise: NoiseEngine,
    rain: RainEngine,
    forest: ForestEngine,
    lofi: LofiEngine,
    minimal: MinimalEngine
};

/**
 * Create and start an engine based on profile config
 */
export async function createEngine(profile) {
    // Dispose current engine if exists
    if (currentEngine) {
        currentEngine.dispose();
        currentEngine = null;
    }

    // Initialize audio if needed
    const initialized = await initProfileEngine();
    if (!initialized) {
        throw new Error('Failed to initialize audio context');
    }

    // Reset transport state for clean start
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    // Create new engine based on type
    const { config } = profile;
    const EngineClass = ENGINE_TYPES[config.type];

    if (!EngineClass) {
        throw new Error(`Unknown profile type: ${config.type}`);
    }

    currentEngine = new EngineClass(config);
    await currentEngine.start();

    // Start transport
    Tone.Transport.start();

    return currentEngine;
}

/**
 * Stop current engine
 */
export function stopEngine() {
    if (currentEngine) {
        currentEngine.stop();
    }
    Tone.Transport.stop();
}

/**
 * Dispose current engine completely
 */
export function disposeEngine() {
    if (currentEngine) {
        currentEngine.dispose();
        currentEngine = null;
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
}

/**
 * Get current engine
 */
export function getCurrentEngine() {
    return currentEngine;
}
