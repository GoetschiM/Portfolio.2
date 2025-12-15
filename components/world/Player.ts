import * as THREE from "three";
import { clamp, lerp } from "@/lib/math";
import { CAMERA_DISTANCE, CAMERA_HEIGHT, PLAYER_SPEED, PLAYER_SPRINT } from "@/lib/config";
import { KeyState } from "./Input";

export class Player {
  position = new THREE.Vector3(0, 0, 0);
  yaw = 0;
  velocity = new THREE.Vector3();
  bob = 0;

  update(keys: KeyState, dt: number) {
    const forward = (keys["ArrowUp"] || keys["KeyW"]) ? 1 : 0;
    const backward = (keys["ArrowDown"] || keys["KeyS"]) ? 1 : 0;
    const left = (keys["ArrowLeft"] || keys["KeyA"]) ? 1 : 0;
    const right = (keys["ArrowRight"] || keys["KeyD"]) ? 1 : 0;
    const sprint = (keys["ShiftLeft"] || keys["ShiftRight"]) ? PLAYER_SPRINT : 1;

    const moveZ = forward - backward;
    const moveX = right - left;

    const speed = PLAYER_SPEED * sprint;
    const target = new THREE.Vector3(moveX, 0, -moveZ);
    if (target.lengthSq() > 1e-3) {
      target.normalize().multiplyScalar(speed);
    }

    this.velocity.lerp(target, 0.18);

    this.position.addScaledVector(this.velocity, dt);
    this.position.x = clamp(this.position.x, -9.5, 9.5);

    if (moveX !== 0 || moveZ !== 0) {
      this.bob += dt * 10;
      const targetYaw = Math.atan2(this.velocity.x, -this.velocity.z);
      this.yaw = lerp(this.yaw, targetYaw, 0.15);
    }
  }

  getCameraTargets() {
    const baseOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
    const offset = baseOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw + Math.PI);
    const camPos = this.position.clone().add(offset);
    const look = this.position.clone().add(new THREE.Vector3(0, 1.4, -2));
    return { camPos, look };
  }
}
