/**
 * EMBERKEEP Retro Synthesizer
 * Generates authentic 8-bit & fantasy audio effects via browser AudioContext.
 * Zero external mp3 dependencies — 100% reliable, zero network latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("emberkeep_muted", muted ? "true" : "false");
    }
  }

  public getMuted(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem("emberkeep_muted") === "true";
    }
    return this.isMuted;
  }

  /**
   * Tactile button click tick
   */
  public playClick() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  /**
   * Conquering a quest: cheerful arpeggio (C5 -> E5 -> G5 -> C6)
   */
  public playQuestComplete() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  /**
   * Gold coin pickup chime: crisp high metallic ding
   */
  public playGoldChime() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  /**
   * Level-Up Triumph: majestic harmonic fanfare
   */
  public playLevelUp() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      [261.63, 329.63, 392.0], // C major
      [329.63, 392.0, 523.25], // E minor / C inv
      [392.0, 493.88, 587.33], // G major
      [523.25, 659.25, 783.99, 1046.5], // High C triumph
    ];

    chords.forEach((chord, step) => {
      const startTime = ctx.currentTime + step * 0.16;
      const duration = step === chords.length - 1 ? 0.7 : 0.22;

      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = step === chords.length - 1 ? "triangle" : "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    });
  }

  /**
   * Flame Ignite / Stoke Hearth: warm crackling ember swoosh
   */
  public playFlameIgnite() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.15); // D5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }
}

export const sounds = new SoundEngine();
