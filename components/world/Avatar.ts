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
    jacket: new THREE.MeshStandardMaterial({ color: "#19345a", roughness: 0.32, metalness: 0.12 }),
    trim: new THREE.MeshStandardMaterial({
      color: "#f97316",
      emissive: new THREE.Color("#f97316"),
      emissiveIntensity: 0.2,
      roughness: 0.35,
      metalness: 0.08,
    }),
    skin: new THREE.MeshStandardMaterial({ color: "#f6d5b6", roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.9 }),
    pants: new THREE.MeshStandardMaterial({ color: "#0d2138", roughness: 0.4, metalness: 0.06 }),
  };

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.05, 0.48), materials.jacket);
  body.position.y = 0.88;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 0.7), materials.skin);
  head.position.y = 1.7;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.76), materials.hair);
  hair.position.y = 1.92;
  hair.castShadow = true;
  group.add(hair);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.22, 0.12), materials.trim);
  visor.position.set(0, 1.75, 0.36);
  visor.castShadow = true;
  group.add(visor);

  const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.18), materials.trim);
  scarf.position.set(0, 1.28, 0.1);
  scarf.castShadow = true;
  group.add(scarf);

  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.42), materials.trim);
  shoulder.position.set(0, 1.32, 0);
  shoulder.castShadow = true;
  group.add(shoulder);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, 0.22), materials.jacket);
  leftArm.position.set(-0.56, 0.95, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, 0.22), materials.jacket);
  rightArm.position.set(0.56, 0.95, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), materials.pants);
  leftLeg.position.set(-0.18, 0.35, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), materials.pants);
  rightLeg.position.set(0.18, 0.35, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.3), materials.trim);
  pack.position.set(0, 1, -0.42);
  pack.castShadow = true;
  group.add(pack);

  const dispose = () => {
    body.geometry.dispose();
    head.geometry.dispose();
    hair.geometry.dispose();
    visor.geometry.dispose();
    scarf.geometry.dispose();
    shoulder.geometry.dispose();
    leftArm.geometry.dispose();
    rightArm.geometry.dispose();
    leftLeg.geometry.dispose();
    rightLeg.geometry.dispose();
    pack.geometry.dispose();
    materials.jacket.dispose();
    materials.trim.dispose();
    materials.skin.dispose();
    materials.hair.dispose();
    materials.pants.dispose();
  };

  const update = (player: Player, t: number) => {
    group.position.copy(player.position).add(new THREE.Vector3(0, 0, 0));
    group.rotation.y = player.yaw;
    const bob = 0.028 * Math.sin(t * 4.8) + 0.05 * Math.sin(player.bob * 8);
    group.position.y = 0.06 + bob;
  };

  return { group, update, dispose };
}
