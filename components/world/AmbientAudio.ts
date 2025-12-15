export class AmbientAudio {
  private ctx: AudioContext | null = null;
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
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.12;

    this.windSource = ctx.createBufferSource();
    this.windSource.buffer = this.createWindBuffer(ctx);
    this.windSource.loop = true;
    this.windSource.connect(this.windGain).connect(ctx.destination);
    this.windSource.start();

    this.stepGain = ctx.createGain();
    this.stepGain.gain.value = 0;
    this.stepOsc = ctx.createOscillator();
    this.stepOsc.type = "triangle";
    this.stepOsc.frequency.value = 120;
    this.stepOsc.connect(this.stepGain).connect(ctx.destination);
    this.stepOsc.start();

    this.started = true;
  }

  setMovementSpeed(speed: number) {
    if (!this.ctx || !this.windGain || !this.stepGain) return;
    const clamped = Math.min(Math.max(speed, 0), 8);
    const wind = 0.08 + (clamped / 8) * 0.18;
    const steps = clamped < 0.15 ? 0 : 0.02 + (clamped / 8) * 0.14;
    this.windGain.gain.linearRampToValueAtTime(wind, this.ctx.currentTime + 0.08);
    this.stepGain.gain.linearRampToValueAtTime(steps, this.ctx.currentTime + 0.04);
  }

  dispose() {
    this.windSource?.stop();
    this.windSource?.disconnect();
    this.stepOsc?.stop();
    this.stepOsc?.disconnect();
    this.windGain?.disconnect();
    this.stepGain?.disconnect();
    this.ctx?.close();
  }
}
