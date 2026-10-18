/**
 * Web Audio API Synthesizer for Cosmic Learning Experience
 * Zero external audio assets required - 100% lightweight & procedural
 */

class CosmicAudioEngine {
    constructor() {
        this.ctx = null;
        this.ambientOsc = null;
        this.ambientGain = null;
        this.isMuted = false;
        this.isAmbientPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (this.isMuted) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    playSuccess() {
        if (this.isMuted) return;
        try {
            this.init();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;

                const startTime = this.ctx.currentTime + (index * 0.08);
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.35);
            });
        } catch (e) {}
    }

    playError() {
        if (this.isMuted) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        } catch (e) {}
    }

    playFlip() {
        if (this.isMuted) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    playLevelUp() {
        if (this.isMuted) return;
        try {
            this.init();
            const chord = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]; // G major arpeggio
            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;

                const start = this.ctx.currentTime + idx * 0.07;
                gain.gain.setValueAtTime(0.25, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(start);
                osc.stop(start + 0.6);
            });
        } catch (e) {}
    }

    toggleAmbient() {
        if (this.isAmbientPlaying) {
            this.stopAmbient();
            return false;
        } else {
            this.startAmbient();
            return true;
        }
    }

    startAmbient() {
        try {
            this.init();
            if (this.ambientOsc) return;

            // Soft cosmic space drone
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            this.ambientGain = this.ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(108, this.ctx.currentTime); // Deep space A2

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(162, this.ctx.currentTime); // Fifth harmonic

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(250, this.ctx.currentTime);

            this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.ambientGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 2);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            osc1.start();
            osc2.start();

            this.ambientOsc = [osc1, osc2];
            this.isAmbientPlaying = true;
        } catch (e) {}
    }

    stopAmbient() {
        try {
            if (this.ambientGain && this.ctx) {
                this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
                setTimeout(() => {
                    if (this.ambientOsc) {
                        this.ambientOsc.forEach(o => o.stop());
                        this.ambientOsc = null;
                    }
                    this.isAmbientPlaying = false;
                }, 1000);
            }
        } catch (e) {
            this.ambientOsc = null;
            this.isAmbientPlaying = false;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.isAmbientPlaying) {
            this.stopAmbient();
        }
        return this.isMuted;
    }
}

export const sound = new CosmicAudioEngine();
