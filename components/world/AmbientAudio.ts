export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private stepGain: GainNode | null = null;
  private stepOsc: OscillatorNode | null = null;
  private started = false;

  private ensureContext() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
  }

  private createWindBuffer(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const r = Math.random() * 2 - 1;
      data[i] = (data[i - 1] || 0) * 0.98 + r * 0.05;
    }
    return buffer;
  }

  resume() {
    this.ensureContext();
    if (!this.ctx || this.started) return;
    const ctx = this.ctx;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;

    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.12;

    this.windSource = ctx.createBufferSource();
    this.windSource.buffer = this.createWindBuffer(ctx);
    this.windSource.loop = true;
    this.windSource.connect(this.windGain).connect(this.masterGain).connect(ctx.destination);
    this.windSource.start();

    this.stepGain = ctx.createGain();
    this.stepGain.gain.value = 0;
    this.stepOsc = ctx.createOscillator();
    this.stepOsc.type = "triangle";
    this.stepOsc.frequency.value = 92;
    this.stepOsc.connect(this.stepGain).connect(this.masterGain).connect(ctx.destination);
    this.stepOsc.start();

    this.started = true;
  }

  setMuted(muted: boolean) {
    if (muted) {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.12);
      }
      return;
    }

    this.ensureContext();
    if (!this.ctx) return;
    if (!this.started) this.resume();
    if (!this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.12);
  }

  setMovementSpeed(speed: number) {
    if (!this.ctx || !this.windGain || !this.stepGain) return;
    const clamped = Math.min(Math.max(speed, 0), 8);
    const wind = 0.08 + (clamped / 8) * 0.18;
    const steps = clamped < 0.18 ? 0 : 0.014 + (clamped / 8) * 0.12;
    this.windGain.gain.linearRampToValueAtTime(wind, this.ctx.currentTime + 0.08);
    this.stepGain.gain.linearRampToValueAtTime(steps, this.ctx.currentTime + 0.05);
  }

  dispose() {
    try {
      this.windSource?.stop();
      this.stepOsc?.stop();
      this.windSource?.disconnect();
      this.stepOsc?.disconnect();
      this.windGain?.disconnect();
      this.stepGain?.disconnect();
      this.masterGain?.disconnect();
      if (this.ctx && this.ctx.state !== "closed") {
        this.ctx.close();
      }
    } catch (err) {
      console.warn("AmbientAudio dispose warning", err);
    } finally {
      this.windSource = null;
      this.windGain = null;
      this.stepOsc = null;
      this.stepGain = null;
      this.masterGain = null;
      this.started = false;
      this.ctx = null;
    }
  }
}
