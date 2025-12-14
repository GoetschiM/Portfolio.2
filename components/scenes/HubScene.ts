import * as THREE from "three";
import { lerp } from "@/lib/math";
import { Player } from "@/components/world/Player";
import { OrganicFlow } from "@/components/systems/OrganicFlow";
import { ManagedScene } from "@/components/world/SceneManager";

export function createHubScene(player: Player): ManagedScene {
  const scene = new THREE.Scene();
  const SKY = new THREE.Color("#87cfff");
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 10, 95);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const hemi = new THREE.HemisphereLight(0xe8f6ff, 0x2c3a22, 0.7);
  hemi.position.set(0, 20, 0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.35);
  sun.position.set(-6, 12, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 1024;
  sun.shadow.mapSize.height = 1024;
  scene.add(sun);

  const groundGeom = new THREE.PlaneGeometry(36, 120);
  const groundMat = new THREE.MeshStandardMaterial({ color: "#20352a", roughness: 1 });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.03, -48);
  ground.receiveShadow = true;
  scene.add(ground);

  const hubCorePos = new THREE.Vector3(0, 1.4, -10);
  const coreGeo = new THREE.IcosahedronGeometry(0.95, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: "#0b1320",
    roughness: 0.28,
    metalness: 0.2,
    emissive: new THREE.Color("#2a6bff"),
    emissiveIntensity: 0.22,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.copy(hubCorePos);
  core.castShadow = true;
  scene.add(core);

  const coreLight = new THREE.PointLight(0x7fb0ff, 1.2, 14, 2);
  coreLight.position.copy(hubCorePos).add(new THREE.Vector3(0, 0.4, 0));
  scene.add(coreLight);

  const flow = new OrganicFlow({
    count: 220,
    center: hubCorePos.clone().add(new THREE.Vector3(0, 0.5, 0)),
    radius: 3.2,
    color: 0x2a6bff,
    size: 0.07,
    opacity: 0.4,
  });
  scene.add(flow.points);

  const beaconGeo = new THREE.TorusGeometry(1.6, 0.08, 16, 64);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x2a6bff,
    emissive: new THREE.Color(0x2a6bff),
    emissiveIntensity: 0.6,
    roughness: 0.18,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.rotation.x = Math.PI / 2;
  beacon.position.copy(hubCorePos).add(new THREE.Vector3(-4, 0.2, -5));
  scene.add(beacon);

  const floorGeo = new THREE.CircleGeometry(12, 64);
  const floorMat = new THREE.MeshStandardMaterial({ color: "#253341", roughness: 0.88, metalness: 0.06 });
  const circle = new THREE.Mesh(floorGeo, floorMat);
  circle.rotation.x = -Math.PI / 2;
  circle.position.set(0, 0, -10);
  circle.receiveShadow = true;
  scene.add(circle);

  let intensity = 0.2;

  return {
    key: "hub",
    scene,
    tick: (t: number, dt: number) => {
      const nearCore = player.position.distanceTo(hubCorePos) < 4.2;
      const targetIntensity = nearCore ? 1.0 : 0.35;
      intensity = lerp(intensity, targetIntensity, 0.08);
      core.rotation.y += (0.35 + intensity * 1.25) * dt;
      core.rotation.x += (0.22 + intensity * intensity) * dt;
      core.position.y = hubCorePos.y + 0.12 * Math.sin(t / 650) + 0.16 * intensity;
      coreMat.emissiveIntensity = 0.18 + intensity * 0.72;
      coreLight.intensity = 0.9 + intensity * 1.6;

      const attract = nearCore ? player.position.clone().add(new THREE.Vector3(0, 1, 0)) : null;
      flow.update(t, intensity, attract);

      beacon.rotation.z = 0.2 * Math.sin(t / 680);
    },
    getCamera: () => {
      const camPos = player.getCameraTargets().cameraPos;
      const look = player.getCameraTargets().look;
      return { camPos, look };
    },
    dispose: () => {
      flow.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      groundGeom.dispose();
      groundMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
    },
  };
}
