export type SceneKey = "hub" | "ai";

export interface WorldStateSnapshot {
  scene: SceneKey;
  fade: number;
}

export class WorldState {
  private scene: SceneKey = "hub";
  private fade = 0;

  getSnapshot(): WorldStateSnapshot {
    return { scene: this.scene, fade: this.fade };
  }

  setScene(next: SceneKey) {
    this.scene = next;
  }

  setFade(f: number) {
    this.fade = f;
  }
}
