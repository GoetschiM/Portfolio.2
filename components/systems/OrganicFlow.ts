import * as THREE from "three";
import { clamp } from "@/lib/math";

export class OrganicFlow {
  points: THREE.Points;
  private geo: THREE.BufferGeometry;
  private mat: THREE.PointsMaterial;
  private seeds: Float32Array;
  private base: Float32Array;
  private count: number;
  private center: THREE.Vector3;
  private radius: number;

  constructor(opts: { count: number; center: THREE.Vector3; radius: number; color: number; size: number; opacity: number }) {
    this.count = opts.count;
    this.center = opts.center.clone();
    this.radius = opts.radius;

    const pos = new Float32Array(this.count * 3);
    this.base = new Float32Array(this.count * 3);
    this.seeds = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = (0.35 + Math.random() * 0.65) * this.radius;
      const y = (Math.random() - 0.5) * 1.6;
      const x = this.center.x + Math.cos(a) * r;
      const z = this.center.z + Math.sin(a) * r;

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = this.center.y + y;
      pos[i * 3 + 2] = z;

      this.base[i * 3 + 0] = x;
      this.base[i * 3 + 1] = this.center.y + y;
      this.base[i * 3 + 2] = z;

      this.seeds[i] = Math.random() * 1000;
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    this.mat = new THREE.PointsMaterial({
      color: opts.color,
      size: opts.size,
      sizeAttenuation: true,
      transparent: true,
      opacity: opts.opacity,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
  }

  update(t: number, intensity: number, attract: THREE.Vector3 | null) {
    const pos = this.geo.getAttribute("position") as THREE.BufferAttribute;

    const spin = 0.55 + intensity * 1.25;
    const wob = 0.35 + intensity * 1.1;
    const pull = intensity * 0.5;

    for (let i = 0; i < this.count; i++) {
      const seed = this.seeds[i];
      const b0 = this.base[i * 3 + 0];
      const b1 = this.base[i * 3 + 1];
      const b2 = this.base[i * 3 + 2];

      const dx = b0 - this.center.x;
      const dz = b2 - this.center.z;
      const a0 = Math.atan2(dz, dx);
      const r0 = Math.sqrt(dx * dx + dz * dz);

      const a = a0 + spin * 0.8 * Math.sin(t / 1000 + seed * 0.03);
      const r = r0 + wob * 0.22 * Math.sin(t / 850 + seed * 0.05);

      let x = this.center.x + Math.cos(a) * r;
      let z = this.center.z + Math.sin(a) * r;
      let y = b1 + wob * 0.16 * Math.sin(t / 720 + seed * 0.07);

      if (attract) {
        const ax = attract.x - x;
        const ay = attract.y - y;
        const az = attract.z - z;
        x += ax * pull * 0.012;
        y += ay * pull * 0.01;
        z += az * pull * 0.012;
      }

      pos.array[i * 3 + 0] = x;
      pos.array[i * 3 + 1] = y;
      pos.array[i * 3 + 2] = z;
    }

    pos.needsUpdate = true;
    this.mat.opacity = clamp(0.3 + intensity * 0.55, 0, 1);
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}
