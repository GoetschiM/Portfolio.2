export type KeyState = Record<string, boolean>;

export class Input {
  private keys: KeyState = {};
  private unsub?: () => void;

  attach() {
    const down = (e: KeyboardEvent) => {
      this.keys[e.code] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    };
    window.addEventListener("keydown", down, { passive: false } as AddEventListenerOptions);
    window.addEventListener("keyup", up);
    this.unsub = () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }

  detach() {
    this.unsub?.();
  }

  snapshot(): KeyState {
    return { ...this.keys };
  }
}
