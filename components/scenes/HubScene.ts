import * as THREE from "three";
import { clamp, lerp } from "@/lib/math";
import { Player } from "@/components/world/Player";
import { OrganicFlow } from "@/components/systems/OrganicFlow";
import { ManagedScene } from "@/components/world/SceneManager";
import { createAvatar } from "@/components/world/Avatar";

const palette = {
  sky: "#b9e8ff",
  water: "#7ddcff",
  grass: "#6ddc8b",
  moss: "#3b6a48",
  cliff: "#d7a56b",
  sand: "#f3d8a4",
  wood: "#b8733f",
  accent: "#f36e4d",
  glow: "#8cf1ff",
  soil: "#c3af8a",
  path: "#d9c8a8",
  flower1: "#ffbde6",
  flower2: "#9fd6ff",
};

type NodeConfig = {
  id: string;
  position: THREE.Vector3;
  title: string;
  subtitle: string;
  color: string;
  triggerRadius: number;
};

const projectNodes: NodeConfig[] = [
  { id: "p1", position: new THREE.Vector3(-6.6, 0, 4), title: "Projekt 1", subtitle: "Plattformen", color: "#86f7c9", triggerRadius: 3.6 },
  { id: "p2", position: new THREE.Vector3(-6.6, 0, 10), title: "Projekt 2", subtitle: "Frontend UX", color: "#8ae2ff", triggerRadius: 3.6 },
  { id: "p3", position: new THREE.Vector3(-6.6, 0, 15.5), title: "Projekt 3", subtitle: "Realtime", color: "#f7d266", triggerRadius: 3.6 },
  { id: "p4", position: new THREE.Vector3(-6.6, 0, 21.2), title: "Projekt 4", subtitle: "Automation", color: "#ffb0df", triggerRadius: 3.6 },
];

const careerNodes: NodeConfig[] = [
  { id: "c1", position: new THREE.Vector3(6.6, 0, 5), title: "2015–2017", subtitle: "Einstieg", color: "#ffd39b", triggerRadius: 3.2 },
  { id: "c2", position: new THREE.Vector3(6.6, 0, 11), title: "2018–2020", subtitle: "Delivery", color: "#8bffcc", triggerRadius: 3.2 },
  { id: "c3", position: new THREE.Vector3(6.6, 0, 17), title: "2021–2023", subtitle: "Lead", color: "#9cb8ff", triggerRadius: 3.2 },
  { id: "c4", position: new THREE.Vector3(6.6, 0, 21.6), title: "Heute", subtitle: "Coaching", color: "#f4a8ff", triggerRadius: 3.2 },
];

function createSign(text: string, subtitle: string, color: string, scale = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context missing");
  ctx.fillStyle = "rgba(7,12,18,0.82)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.fillStyle = color;
  ctx.font = "900 120px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillStyle = "#b8d3ff";
  ctx.font = "700 70px 'Inter', sans-serif";
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 60);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.95 });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.4 * scale, 1.8 * scale, 1);
  sprite.position.y = 2.2 * scale;

  return {
    sprite,
    dispose: () => {
      mat.dispose();
      tex.dispose();
      canvas.remove();
    },
  };
}

function createFloatingCloud(color: string, radius: number) {
  const cloud = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05 });
  const puffCount = 9 + Math.floor(Math.random() * 6);
  for (let i = 0; i < puffCount; i++) {
    const cube = new THREE.Mesh(geo, mat);
    cube.scale.setScalar(radius * (0.6 + Math.random() * 0.55));
    cube.position.set((Math.random() - 0.5) * radius * 2.4, (Math.random() - 0.5) * radius * 1.2, (Math.random() - 0.5) * radius * 2.4);
    cube.castShadow = true;
    cloud.add(cube);
  }
  return { cloud, dispose: () => { geo.dispose(); mat.dispose(); } };
}

function createFlower(group: THREE.Group, x: number, z: number, color: string) {
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.6, 6);
  const blossomGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: "#4ac57f", roughness: 0.45, emissive: new THREE.Color("#4ac57f"), emissiveIntensity: 0.18 });
  const blossomMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05, emissive: new THREE.Color(color), emissiveIntensity: 0.22 });

  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(x, 0.35, z);
  stem.castShadow = true;
  group.add(stem);

  const blossom = new THREE.Mesh(blossomGeo, blossomMat);
  blossom.position.set(x + (Math.random() - 0.5) * 0.06, 0.75, z + (Math.random() - 0.5) * 0.06);
  blossom.scale.setScalar(0.9 + Math.random() * 0.18);
  blossom.castShadow = true;
  group.add(blossom);

  return () => {
    stemGeo.dispose();
    blossomGeo.dispose();
    stemMat.dispose();
    blossomMat.dispose();
  };
}

function createTree(group: THREE.Group, x: number, z: number, scale = 1) {
  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.32, 1.9, 8);
  const capGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.16, 6);
  const canopyGeo = new THREE.BoxGeometry(1.6, 1.25, 1.6);
  const canopyTopGeo = new THREE.BoxGeometry(1.2, 1.1, 1.2);
  const trunkMat = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.58, metalness: 0.08 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: "#43e491", roughness: 0.4, emissive: new THREE.Color("#43e491"), emissiveIntensity: 0.16 });

  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(x, 0.95 * scale, z);
  trunk.scale.setScalar(scale);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const cap = new THREE.Mesh(capGeo, trunkMat);
  cap.position.set(x, 1.92 * scale, z);
  cap.scale.setScalar(scale * 1.05);
  cap.castShadow = true;
  cap.receiveShadow = true;
  group.add(cap);

  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(x, 2.25 * scale, z);
  canopy.scale.setScalar(scale * (0.9 + Math.random() * 0.2));
  canopy.rotation.y = Math.random() * Math.PI;
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  group.add(canopy);

  const canopyTop = new THREE.Mesh(canopyTopGeo, canopyMat);
  canopyTop.position.set(x + (Math.random() - 0.5) * 0.28 * scale, 2.9 * scale, z + (Math.random() - 0.5) * 0.28 * scale);
  canopyTop.scale.setScalar(scale * (0.8 + Math.random() * 0.2));
  canopyTop.castShadow = true;
  canopyTop.receiveShadow = true;
  group.add(canopyTop);

  return () => {
    trunkGeo.dispose();
    capGeo.dispose();
    canopyGeo.dispose();
    canopyTopGeo.dispose();
    trunkMat.dispose();
    canopyMat.dispose();
  };
}

function createNode(group: THREE.Group, config: NodeConfig) {
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.4, 28),
    new THREE.MeshStandardMaterial({ color: "#0f171f", roughness: 0.72, metalness: 0.08 }),
  );
  pad.position.copy(config.position);
  pad.position.y = 0.22;
  pad.castShadow = true;
  pad.receiveShadow = true;
  group.add(pad);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.12, 12, 36),
    new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.34, metalness: 0.22, emissive: new THREE.Color(config.color), emissiveIntensity: 0.3 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.copy(config.position);
  ring.position.y = 0.28;
  ring.castShadow = true;
  ring.receiveShadow = true;
  group.add(ring);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16),
    new THREE.MeshStandardMaterial({ color: config.color, emissive: new THREE.Color(config.color), emissiveIntensity: 0.8, roughness: 0.35 }),
  );
  stem.position.copy(config.position);
  stem.position.y = 1.2;
  stem.castShadow = true;
  stem.receiveShadow = true;
  group.add(stem);

  const gem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58, 0), new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.28,
    metalness: 0.35,
    emissive: new THREE.Color(config.color),
    emissiveIntensity: 0.4,
  }));
  gem.position.copy(config.position);
  gem.position.y = 2.2;
  gem.castShadow = true;
  gem.receiveShadow = true;
  group.add(gem);

  const sign = createSign(config.title, config.subtitle, config.color, 0.95);
  sign.sprite.position.set(config.position.x, 2.8, config.position.z + 0.6);
  group.add(sign.sprite);

  const light = new THREE.PointLight(config.color, 1.2, 9, 2);
  light.position.set(config.position.x, 2.6, config.position.z);
  group.add(light);

  return {
    tick: (t: number, player: THREE.Vector3) => {
      const dist = player.distanceTo(config.position);
      const pulse = THREE.MathUtils.clamp(1 - dist / config.triggerRadius, 0, 1);
      light.intensity = 0.8 + pulse * 1.2;
      gem.rotation.y += 0.01;
      ring.scale.setScalar(1 + pulse * 0.1 + 0.02 * Math.sin(t * 0.8));
      (sign.sprite.material as THREE.SpriteMaterial).opacity = 0.75 + pulse * 0.2;
    },
    dispose: () => {
      (pad.geometry as THREE.CylinderGeometry).dispose();
      (pad.material as THREE.Material).dispose();
      (ring.geometry as THREE.TorusGeometry).dispose();
      (ring.material as THREE.Material).dispose();
      (stem.geometry as THREE.CylinderGeometry).dispose();
      (stem.material as THREE.Material).dispose();
      (gem.geometry as THREE.BufferGeometry).dispose();
      (gem.material as THREE.Material).dispose();
      sign.dispose();
      light.dispose();
    },
  };
}

export function createHubScene(player: Player): ManagedScene {
  const scene = new THREE.Scene();
  const SKY = new THREE.Color(palette.sky);
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 12, 95);

  scene.add(new THREE.AmbientLight(0xffffff, 0.76));
  const hemi = new THREE.HemisphereLight(0xdff6ff, 0x27443a, 0.8);
  hemi.position.set(0, 30, 0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe6b3, 1.8);
  sun.position.set(-16, 24, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 28;
  sun.shadow.camera.bottom = -28;
  scene.add(sun);

  const bounce = new THREE.DirectionalLight(0x8ecfff, 0.5);
  bounce.position.set(12, 12, -16);
  scene.add(bounce);

  const avatar = createAvatar();
  avatar.group.scale.setScalar(0.52);
  scene.add(avatar.group);

  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const island = new THREE.Group();
  worldRoot.add(island);

  const cliffGeo = new THREE.BoxGeometry(32, 6.4, 50);
  const cliffMat = new THREE.MeshStandardMaterial({ color: palette.cliff, roughness: 0.74, metalness: 0.08 });
  const cliff = new THREE.Mesh(cliffGeo, cliffMat);
  cliff.position.y = -3.3;
  cliff.receiveShadow = true;
  cliff.castShadow = true;
  island.add(cliff);

  const midGeo = new THREE.BoxGeometry(30, 2.3, 46);
  const midMat = new THREE.MeshStandardMaterial({ color: palette.sand, roughness: 0.68, metalness: 0.06 });
  const mid = new THREE.Mesh(midGeo, midMat);
  mid.position.y = -1.6;
  mid.receiveShadow = true;
  mid.castShadow = true;
  island.add(mid);

  const topGeo = new THREE.BoxGeometry(28, 1, 44);
  const topMat = new THREE.MeshStandardMaterial({ color: palette.grass, roughness: 0.48, metalness: 0.08 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.12;
  top.receiveShadow = true;
  top.castShadow = true;
  island.add(top);

  const rimGeo = new THREE.BoxGeometry(27, 0.18, 42);
  const rimMat = new THREE.MeshStandardMaterial({ color: palette.moss, roughness: 0.64 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = 0.7;
  rim.receiveShadow = true;
  rim.castShadow = true;
  island.add(rim);

  const soilGeo = new THREE.BoxGeometry(26, 0.12, 40);
  const soilMat = new THREE.MeshStandardMaterial({ color: palette.soil, roughness: 0.6, metalness: 0.05 });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.63;
  soil.receiveShadow = true;
  soil.castShadow = true;
  island.add(soil);

  const pathGeo = new THREE.BoxGeometry(3.2, 0.12, 44);
  const pathMat = new THREE.MeshStandardMaterial({ color: palette.path, roughness: 0.44, metalness: 0.08 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.position.set(0, 0.66, 6);
  path.receiveShadow = true;
  path.castShadow = true;
  island.add(path);

  const waterGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.6, 32);
  const waterMat = new THREE.MeshStandardMaterial({ color: palette.water, roughness: 0.16, metalness: 0.22, transparent: true, opacity: 0.85 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = 0;
  water.position.set(1.6, 0.4, 2.2);
  water.receiveShadow = true;
  island.add(water);

  const waterfallGeo = new THREE.PlaneGeometry(2.2, 4.2);
  const waterfallMat = new THREE.MeshStandardMaterial({
    color: palette.water,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
  });
  const waterfall = new THREE.Mesh(waterfallGeo, waterfallMat);
  waterfall.position.set(1.6, -1, 9.2);
  waterfall.rotation.y = Math.PI;
  island.add(waterfall);

  const dockGeo = new THREE.BoxGeometry(6, 0.4, 2.8);
  const dockMat = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.48, metalness: 0.06 });
  const dock = new THREE.Mesh(dockGeo, dockMat);
  dock.position.set(-1, 0.3, -6.5);
  dock.castShadow = true;
  dock.receiveShadow = true;
  island.add(dock);

  const cabin = new THREE.Group();
  const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3), new THREE.MeshStandardMaterial({ color: "#f3e5cf", roughness: 0.42 }));
  cabinBase.position.set(-2.2, 1.2, -2.8);
  cabinBase.castShadow = true;
  cabinBase.receiveShadow = true;
  cabin.add(cabinBase);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.4, 5), new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.32, metalness: 0.08 }));
  roof.position.set(-2.2, 2.4, -2.8);
  roof.castShadow = true;
  roof.receiveShadow = true;
  cabin.add(roof);

  const porch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.8), new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.52 }));
  porch.position.set(-2.2, 0.25, -0.9);
  porch.castShadow = true;
  porch.receiveShadow = true;
  cabin.add(porch);

  island.add(cabin);

  const steppingGeo = new THREE.BoxGeometry(1.6, 0.2, 1.6);
  const steppingMat = new THREE.MeshStandardMaterial({ color: "#e8f2ff", roughness: 0.38, metalness: 0.1 });
  const steppingStones: THREE.Mesh[] = [];
  const addStep = (x: number, z: number) => {
    const s = new THREE.Mesh(steppingGeo, steppingMat);
    s.position.set(x, 0.25, z);
    s.castShadow = true;
    s.receiveShadow = true;
    steppingStones.push(s);
    island.add(s);
  };

  for (let z = -14; z <= 28; z += 2.4) {
    addStep(0, z);
  }
  for (let z = -2; z <= 26; z += 3) {
    addStep(-6.8, z);
    addStep(6.8, z + 1.4);
  }

  const grassTuftGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 6);
  const grassTuftMat = new THREE.MeshStandardMaterial({ color: "#6ef3a2", roughness: 0.36, emissive: new THREE.Color("#6ef3a2"), emissiveIntensity: 0.08 });
  for (let i = 0; i < 200; i++) {
    const tuft = new THREE.Mesh(grassTuftGeo, grassTuftMat);
    tuft.position.set((Math.random() - 0.5) * 22, 0.5 + Math.random() * 0.18, -18 + Math.random() * 36);
    tuft.castShadow = true;
    tuft.receiveShadow = true;
    island.add(tuft);
  }

  const treeDisposers: Array<() => void> = [];
  const treePositions: Array<[number, number]> = [
    [-4, 4],
    [-3, 8],
    [4, 5.4],
    [5.4, -1.4],
    [1.2, -4.2],
    [3.4, 11],
    [-6.5, 14.4],
    [-7.4, 6],
    [7.2, 3],
    [-2.4, 22.8],
    [2.6, 24],
    [6.2, 18.6],
    [-5.8, 20.4],
    [0.8, 15.2],
  ];
  treePositions.forEach(([x, z]) => treeDisposers.push(createTree(island, x, z, 0.9 + Math.random() * 0.35)));

  const flowerDisposers: Array<() => void> = [];
  for (let i = 0; i < 80; i++) {
    const x = (Math.random() - 0.5) * 18;
    const z = -10 + Math.random() * 40;
    const color = Math.random() > 0.5 ? palette.flower1 : palette.flower2;
    flowerDisposers.push(createFlower(island, x, z, color));
  }

  const clouds: Array<{ cloud: THREE.Group; dispose: () => void; speed: number }> = [];
  const cloudColors = ["#f7fbff", "#eaf5ff", "#f2fbff"];
  for (let i = 0; i < 12; i++) {
    const entry = createFloatingCloud(cloudColors[i % cloudColors.length], 1.35 + Math.random() * 0.7);
    entry.cloud.position.set(-18 + Math.random() * 36, 9 + Math.random() * 7, -10 + Math.random() * 38);
    clouds.push({ ...entry, speed: 0.32 + Math.random() * 0.5 });
    scene.add(entry.cloud);
  }

  const flow = new OrganicFlow({
    count: 160,
    center: new THREE.Vector3(1.5, 1.2, 1.5),
    radius: 3.3,
    color: 0x7ddcff,
    size: 0.08,
    opacity: 0.42,
  });
  worldRoot.add(flow.points);

  const nodeTickers: Array<(t: number, player: THREE.Vector3) => void> = [];
  const disposers: Array<() => void> = [
    () => {
      cliffGeo.dispose();
      cliffMat.dispose();
      midGeo.dispose();
      midMat.dispose();
      topGeo.dispose();
      topMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      soilGeo.dispose();
      soilMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      waterfallGeo.dispose();
      waterfallMat.dispose();
      dockGeo.dispose();
      dockMat.dispose();
      steppingGeo.dispose();
      steppingMat.dispose();
      grassTuftGeo.dispose();
      grassTuftMat.dispose();
    },
    () => {
      cabin.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
    },
    () => {
      clouds.forEach((c) => c.dispose());
    },
    () => {
      treeDisposers.forEach((fn) => fn());
    },
    () => {
      flowerDisposers.forEach((fn) => fn());
    },
  ];

  projectNodes.forEach((node) => {
    const entry = createNode(island, node);
    nodeTickers.push(entry.tick);
    disposers.push(entry.dispose);
  });

  careerNodes.forEach((node) => {
    const entry = createNode(island, node);
    nodeTickers.push(entry.tick);
    disposers.push(entry.dispose);
  });

  player.position.set(0, 0, -2);

  let wind = 0.32;

  const anchorMap: Record<"intro" | "projects" | "career", THREE.Vector3> = {
    intro: new THREE.Vector3(0, 0, -2),
    projects: projectNodes[0].position.clone().add(new THREE.Vector3(0, 0, -1)),
    career: careerNodes[0].position.clone().add(new THREE.Vector3(0, 0, -1)),
  };

  return {
    key: "hub",
    scene,
    tick: (t: number) => {
      player.position.x = clamp(player.position.x, -10.5, 10.5);
      player.position.z = clamp(player.position.z, -14, 30);

      const nearPool = player.position.distanceTo(new THREE.Vector3(1.6, 0, 2.2)) < 4.5;
      const targetWind = nearPool ? 0.68 : 0.38;
      wind = lerp(wind, targetWind, 0.06);
      flow.update(t, wind, new THREE.Vector3(1.5, 1.2 + Math.sin(t) * 0.04, 1.5));

      clouds.forEach((entry, idx) => {
        entry.cloud.position.x += entry.speed * 0.02;
        if (entry.cloud.position.x > 20) entry.cloud.position.x = -20;
        entry.cloud.position.y += Math.sin(t * 0.6 + idx) * 0.002;
      });

      nodeTickers.forEach((fn) => fn(t, player.position));
      avatar.update(player, t * 1000);
      sun.intensity = 1.2 + 0.25 * wind;
    },
    getCamera: () => {
      const base = new THREE.Vector3(0, 11.4, 14);
      const camPos = player.position.clone().add(base).add(new THREE.Vector3(0, 0, -player.position.z * 0.04));
      const look = new THREE.Vector3(player.position.x * 0.5, 1.8, player.position.z + 2);
      return { camPos, look };
    },
    setAnchor: (anchor) => {
      const target = anchorMap[anchor];
      player.position.copy(target.clone());
    },
    dispose: () => {
      flow.dispose();
      avatar.dispose();
      disposers.forEach((fn) => fn());
    },
  };
}
