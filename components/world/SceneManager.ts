import * as THREE from "three";
import { SceneKey } from "@/lib/state";
import { createHubScene } from "@/components/scenes/HubScene";
import { createAIScene } from "@/components/scenes/AIScene";
import { Player } from "./Player";
import { KeyState } from "./Input";

export interface ManagedScene {
  key: SceneKey;
  scene: THREE.Scene;
  tick: (t: number, dt: number) => void;
  getCamera: () => { camPos: THREE.Vector3; look: THREE.Vector3 };
  dispose: () => void;
  setAnchor?: (anchor: "intro" | "projects" | "career" | "ai") => void;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private player: Player;
  private active: ManagedScene;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, player: Player) {
    this.renderer = renderer;
    this.camera = camera;
    this.player = player;
    this.active = createHubScene(this.player);

    const { camPos, look } = this.active.getCamera();
    this.camera.position.copy(camPos);
    this.camera.lookAt(look);
  }

  get sceneKey() {
    return this.active.key;
  }

  switchScene(key: SceneKey) {
    if (this.active.key === key) return;
    this.active.dispose();
    this.active = key === "hub" ? createHubScene(this.player) : createAIScene(this.player);

    const { camPos, look } = this.active.getCamera();
    this.camera.position.copy(camPos);
    this.camera.lookAt(look);
  }

  jumpToAnchor(anchor: "intro" | "projects" | "career" | "ai") {
    if (this.active.key !== "hub") return;
    this.active.setAnchor?.(anchor);
  }

  update(keys: KeyState, t: number, dt: number) {
    this.player.update(keys, dt);
    this.active.tick(t, dt);
    const { camPos, look } = this.active.getCamera();
    const smooth = 1 - Math.pow(0.0006, dt);
    this.camera.position.lerp(camPos, smooth);
    this.camera.lookAt(look);
    this.renderer.render(this.active.scene, this.camera);
  }
}
