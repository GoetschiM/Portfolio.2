import * as THREE from "three";
import { lerp } from "@/lib/math";
import { Player } from "@/components/world/Player";
import { ManagedScene } from "@/components/world/SceneManager";
import { createAvatar } from "@/components/world/Avatar";

export function createAIScene(player: Player): ManagedScene {
  const scene = new THREE.Scene();
  const BG = new THREE.Color("#060a10");
  scene.background = BG;
  scene.fog = new THREE.Fog(BG, 8, 55);

  scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  const rim = new THREE.DirectionalLight(0x7fb0ff, 0.65);
  rim.position.set(6, 10, 8);
  scene.add(rim);

  const floorGeo = new THREE.PlaneGeometry(26, 22);
  const floorMat = new THREE.MeshStandardMaterial({ color: "#0a0f18", roughness: 1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  const nodeGeo = new THREE.SphereGeometry(0.55, 18, 18);
  const nodeMatIn = new THREE.MeshStandardMaterial({ color: "#2a6bff", roughness: 0.25, metalness: 0.12, emissive: new THREE.Color("#2a6bff"), emissiveIntensity: 0.45 });
  const nodeMatAgent = new THREE.MeshStandardMaterial({ color: "#6aa8ff", roughness: 0.3, metalness: 0.12, emissive: new THREE.Color("#6aa8ff"), emissiveIntensity: 0.35 });
  const nodeMatOut = new THREE.MeshStandardMaterial({ color: "#2bd67b", roughness: 0.25, metalness: 0.12, emissive: new THREE.Color("#2bd67b"), emissiveIntensity: 0.45 });

  const inputPos = new THREE.Vector3(-4.5, 1.2, -5);
  const agentPos = new THREE.Vector3(0, 1.5, -9);
  const outputPos = new THREE.Vector3(4.5, 1.2, -5);

  const inputNode = new THREE.Mesh(nodeGeo, nodeMatIn);
  inputNode.position.copy(inputPos);
  inputNode.castShadow = true;
  scene.add(inputNode);

  const agentNode = new THREE.Mesh(nodeGeo, nodeMatAgent);
  agentNode.position.copy(agentPos);
  agentNode.castShadow = true;
  scene.add(agentNode);

  const outputNode = new THREE.Mesh(nodeGeo, nodeMatOut);
  outputNode.position.copy(outputPos);
  outputNode.castShadow = true;
  scene.add(outputNode);

  const lineMat = new THREE.LineBasicMaterial({ color: 0x275aa8, transparent: true, opacity: 0.55 });
  const mkLine = (a: THREE.Vector3, b: THREE.Vector3) => {
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    const l = new THREE.Line(g, lineMat);
    scene.add(l);
    return { line: l, geo: g };
  };
  const l1 = mkLine(inputPos, agentPos);
  const l2 = mkLine(agentPos, outputPos);

  const segCount = 96;
  const dataGeo = new THREE.BufferGeometry();
  const dataPos = new Float32Array(segCount * 3);
  const dataSeed = new Float32Array(segCount);
  for (let i = 0; i < segCount; i++) {
    dataSeed[i] = Math.random() * 1000;
    dataPos[i * 3 + 0] = 0;
    dataPos[i * 3 + 1] = 1;
    dataPos[i * 3 + 2] = 0;
  }
  dataGeo.setAttribute("position", new THREE.BufferAttribute(dataPos, 3));
  const dataMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.9, depthWrite: false });
  const dataPts = new THREE.Points(dataGeo, dataMat);
  scene.add(dataPts);

  const avatar = createAvatar();
  avatar.group.scale.setScalar(0.6);
  scene.add(avatar.group);

  const decorGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const decorMat = new THREE.MeshStandardMaterial({ color: "#0d1726", emissive: new THREE.Color("#2a6bff"), emissiveIntensity: 0.12 });
  for (let i = 0; i < 24; i++) {
    const cube = new THREE.Mesh(decorGeo, decorMat);
    cube.position.set(-10 + Math.random() * 20, 0.28, -2 + Math.random() * -12);
    cube.rotation.y = Math.random() * Math.PI;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
  }

  player.position.set(0, 0, 2.5);

  let intensity = 0.2;
  let lastInput = performance.now();
  let phase: "input" | "agent" | "output" | "done" = "input";

  return {
    key: "ai",
    scene,
    tick: (t: number, dt: number) => {
      const since = performance.now() - lastInput;
      const target = since > 1600 ? 0.2 : 0.9;
      intensity = lerp(intensity, target, 0.08);

      const posAttr = dataGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < segCount; i++) {
        const seed = dataSeed[i];
        const phaseT = (t * 0.25 + seed) % 1;
        const first = phaseT < 0.5;
        const u = first ? phaseT / 0.5 : (phaseT - 0.5) / 0.5;
        const a = first ? inputNode.position : agentNode.position;
        const b = first ? agentNode.position : outputNode.position;
        const x = THREE.MathUtils.lerp(a.x, b.x, u) + 0.05 * Math.sin(t + seed);
        const y = THREE.MathUtils.lerp(a.y, b.y, u) + 0.05 * Math.cos(t + seed);
        const z = THREE.MathUtils.lerp(a.z, b.z, u) + 0.05 * Math.sin(t * 0.8 + seed);
        posAttr.array[i * 3 + 0] = x;
        posAttr.array[i * 3 + 1] = y;
        posAttr.array[i * 3 + 2] = z;
      }
      posAttr.needsUpdate = true;
      dataMat.opacity = 0.5 + intensity * 0.5;

      const playerPos = player.position;
      const nearInput = playerPos.distanceTo(inputPos) < 2;
      const nearAgent = playerPos.distanceTo(agentPos) < 2;
      const nearOutput = playerPos.distanceTo(outputPos) < 2;
      if (phase === "input" && nearInput) {
        phase = "agent";
        lastInput = performance.now();
      } else if (phase === "agent" && nearAgent) {
        phase = "output";
        lastInput = performance.now();
      } else if (phase === "output" && nearOutput) {
        phase = "done";
        lastInput = performance.now();
      }

      (nodeMatIn as THREE.MeshStandardMaterial).emissiveIntensity = phase === "input" ? 1 : 0.45;
      (nodeMatAgent as THREE.MeshStandardMaterial).emissiveIntensity = phase === "agent" ? 1 : 0.45;
      (nodeMatOut as THREE.MeshStandardMaterial).emissiveIntensity = phase === "output" || phase === "done" ? 1 : 0.45;

      avatar.update(player, t);
    },
    getCamera: () => {
      const base = new THREE.Vector3(7, 7.6, 10);
      const camPos = player.position.clone().add(base);
      const look = new THREE.Vector3(player.position.x, 1.4, player.position.z - 2);
      return { camPos, look };
    },
    dispose: () => {
      floorGeo.dispose();
      floorMat.dispose();
      nodeGeo.dispose();
      nodeMatIn.dispose();
      nodeMatAgent.dispose();
      nodeMatOut.dispose();
      l1.geo.dispose();
      l2.geo.dispose();
      lineMat.dispose();
      dataGeo.dispose();
      dataMat.dispose();
      decorGeo.dispose();
      decorMat.dispose();
      avatar.dispose();
    },
  };
}
