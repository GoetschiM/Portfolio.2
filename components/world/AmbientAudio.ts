const AMBIENT_TRACK_URL =
  "https://cdn.pixabay.com/download/audio/2022/10/30/audio_331239b338.mp3?filename=calm-ambient-124844.mp3";

export class AmbientAudio {
  private audio: HTMLAudioElement | null = null;
  private muted = true;
  private targetVolume = 0.28;

  private ensureAudio() {
    if (this.audio) return;
    const el = new Audio(AMBIENT_TRACK_URL);
    el.crossOrigin = "anonymous";
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    this.audio = el;
  }

  resume() {
    this.ensureAudio();
    if (!this.audio) return;
    this.audio.play().catch(() => {
      /* Autoplay kann blockiert sein – wir versuchen es erneut, sobald unmuted */
    });
  }

  setMuted(muted: boolean) {
    this.ensureAudio();
    if (!this.audio) return;
    this.muted = muted;
    if (muted) {
      this.audio.volume = 0;
      this.audio.muted = true;
      return;
    }

    this.audio.muted = false;
    this.resume();
    this.audio.volume = this.targetVolume;
  }

  setMovementSpeed(speed: number) {
    if (!this.audio) return;
    const clamped = Math.min(Math.max(speed, 0), 6);
    this.targetVolume = 0.22 + (clamped / 6) * 0.16;
    if (!this.muted) {
      this.audio.volume = this.targetVolume;
    }
  }

  dispose() {
    if (this.audio) {
      try {
        this.audio.pause();
      } catch (err) {
        console.warn("AmbientAudio dispose warning", err);
      }
    }
    this.audio = null;
  }
}
