class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.soundToggle = null;

        // Initialize audio context on user interaction
        this.initAudioContext();
        this.bindControls();
    }

    initAudioContext() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    bindControls() {
        this.soundToggle = document.getElementById('soundToggle');
        this.soundToggle.addEventListener('click', () => this.toggleSound());
    }

    toggleSound() {
        this.enabled = !this.enabled;
        this.soundToggle.textContent = this.enabled ? '🔊' : '🔇';
        this.soundToggle.classList.toggle('muted', !this.enabled);

        // Play a test sound when enabling
        if (this.enabled) {
            this.playCollectSound();
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCollectSound() {
        if (!this.enabled) return;

        // Pleasant "ding" sound for collecting flowers
        this.playTone(523.25, 0.1, 'sine', 0.2); // C5
        setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.15), 50); // E5
        setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.1), 100); // G5
    }

    playPowerUpSound() {
        if (!this.enabled) return;

        // Sparkly "power-up" sound
        this.playTone(440, 0.1, 'square', 0.1); // A4
        setTimeout(() => this.playTone(554.37, 0.1, 'square', 0.1), 50); // C#5
        setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.1), 100); // E5
        setTimeout(() => this.playTone(880, 0.2, 'square', 0.05), 150); // A5
    }

    playMoveSound() {
        if (!this.enabled || Math.random() > 0.3) return; // Play only 30% of the time to avoid annoyance

        // Soft "whoosh" sound for movement
        this.playTone(200, 0.05, 'sine', 0.05);
    }

    playGameOverSound() {
        if (!this.enabled) return;

        // Descending notes for game over
        this.playTone(523.25, 0.3, 'sine', 0.2); // C5
        setTimeout(() => this.playTone(440, 0.3, 'sine', 0.15), 200); // A4
        setTimeout(() => this.playTone(349.23, 0.3, 'sine', 0.1), 400); // F4
        setTimeout(() => this.playTone(261.63, 0.4, 'sine', 0.05), 600); // C4
    }

    playStartSound() {
        if (!this.enabled) return;

        // Upbeat "let's go" sound
        this.playTone(440, 0.1, 'square', 0.1); // A4
        setTimeout(() => this.playTone(523.25, 0.1, 'square', 0.1), 100); // C5
        setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.1), 200); // E5
        setTimeout(() => this.playTone(880, 0.2, 'square', 0.15), 300); // A5
    }

    playHoneySound() {
        if (!this.enabled) return;

        // Sweet "honey drop" sound
        this.playTone(800, 0.05, 'triangle', 0.1);
        setTimeout(() => this.playTone(1000, 0.05, 'triangle', 0.08), 30);
        setTimeout(() => this.playTone(1200, 0.05, 'triangle', 0.06), 60);
    }

    playTimerSound() {
        if (!this.enabled) return;

        // Warning beep when time is low
        this.playTone(440, 0.1, 'sawtooth', 0.1);
    }
}

// Export for use in game
window.SoundManager = SoundManager;