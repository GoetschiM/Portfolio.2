import * as THREE from "three";
import { Player } from "./Player";

export interface AvatarRig {
  group: THREE.Group;
  update: (player: Player, t: number) => void;
  dispose: () => void;
}

export function createAvatar(): AvatarRig {
  const group = new THREE.Group();
  group.castShadow = true;
  group.receiveShadow = true;

  const materials = {
    suit: new THREE.MeshStandardMaterial({ color: "#1c2f3d", roughness: 0.4, metalness: 0.08 }),
    accent: new THREE.MeshStandardMaterial({ color: "#5fb0ff", emissive: new THREE.Color("#5fb0ff"), emissiveIntensity: 0.35, roughness: 0.2 }),
    skin: new THREE.MeshStandardMaterial({ color: "#f5d7c5", roughness: 0.65 }),
  };

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), materials.suit);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), materials.skin);
  head.position.y = 1.75;
  head.castShadow = true;
  group.add(head);

  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82), materials.accent);
  helmet.position.y = 1.78;
  helmet.castShadow = true;
  group.add(helmet);

  const lamp = new THREE.PointLight(0x7fb0ff, 1.6, 6, 2);
  lamp.position.set(0, 1.9, 0.36);
  group.add(lamp);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.7, 0.32), materials.suit);
  leftLeg.position.set(-0.22, 0.35, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.7, 0.32), materials.suit);
  rightLeg.position.set(0.22, 0.35, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1, 0.25), materials.accent);
  backpack.position.set(0, 1.05, -0.45);
  backpack.castShadow = true;
  group.add(backpack);

  const dispose = () => {
    body.geometry.dispose();
    head.geometry.dispose();
    helmet.geometry.dispose();
    leftLeg.geometry.dispose();
    rightLeg.geometry.dispose();
    backpack.geometry.dispose();
    materials.suit.dispose();
    materials.accent.dispose();
    materials.skin.dispose();
  };

  const update = (player: Player, t: number) => {
    group.position.copy(player.position).add(new THREE.Vector3(0, 0, 0));
    group.rotation.y = player.yaw;
    const bob = 0.03 * Math.sin(t * 4.5) + 0.05 * Math.sin(player.bob * 8);
    group.position.y = 0.02 + bob;
  };

  return { group, update, dispose };
}
