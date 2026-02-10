/**
 * Tone.js wrapper - Import from npm package
 */
import * as Tone from 'tone';

// Make Tone available globally for compatibility
if (typeof window !== 'undefined') {
    window.Tone = Tone;
}

export default Tone;
export { Tone };
