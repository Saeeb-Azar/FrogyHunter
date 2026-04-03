/**
 * FROGGY HUNT - Audio System
 * Web Audio API based sound effects (no external files needed)
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.hapticEnabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not available:', e);
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Generate a simple tone
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.sfxEnabled || !this.ctx) return;
        this.ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // Sound: Found a frog!
    playFrogFound() {
        if (!this.sfxEnabled) return;
        this.ensureContext();

        // Happy ascending chirp
        setTimeout(() => this.playTone(523, 0.15, 'sine', 0.25), 0);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 80);
        setTimeout(() => this.playTone(784, 0.25, 'sine', 0.3), 160);
    }

    // Sound: Wrong tap
    playWrongTap() {
        if (!this.sfxEnabled) return;
        this.playTone(200, 0.2, 'square', 0.1);
    }

    // Sound: Button click
    playClick() {
        if (!this.sfxEnabled) return;
        this.playTone(800, 0.05, 'sine', 0.15);
    }

    // Sound: Level complete!
    playLevelComplete() {
        if (!this.sfxEnabled) return;
        this.ensureContext();

        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.2), i * 100);
        });
    }

    // Sound: Star earned
    playStar() {
        if (!this.sfxEnabled) return;
        this.playTone(1200, 0.3, 'sine', 0.2);
    }

    // Sound: Hint used
    playHint() {
        if (!this.sfxEnabled) return;
        this.playTone(440, 0.15, 'triangle', 0.2);
        setTimeout(() => this.playTone(550, 0.15, 'triangle', 0.2), 100);
    }

    // Sound: Level up
    playLevelUp() {
        if (!this.sfxEnabled) return;
        this.ensureContext();

        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.4, 'sine', 0.25), i * 150);
        });
    }

    // Haptic feedback
    vibrate(pattern) {
        if (!this.hapticEnabled) return;
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    vibrateLight() {
        this.vibrate(10);
    }

    vibrateMedium() {
        this.vibrate(25);
    }

    vibrateSuccess() {
        this.vibrate([15, 50, 15]);
    }

    setMusic(enabled) {
        this.musicEnabled = enabled;
    }

    setSfx(enabled) {
        this.sfxEnabled = enabled;
    }

    setHaptic(enabled) {
        this.hapticEnabled = enabled;
    }
}

const audio = new AudioManager();
