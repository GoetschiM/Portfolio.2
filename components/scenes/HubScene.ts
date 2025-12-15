import * as THREE from "three";
import { lerp } from "@/lib/math";
import { Player } from "@/components/world/Player";
import { OrganicFlow } from "@/components/systems/OrganicFlow";
import { ManagedScene } from "@/components/world/SceneManager";
import { createAvatar } from "@/components/world/Avatar";

const CHUNK_SIZE = 16;
const ACTIVE_RADIUS = 1;
const TRACK_PROJECT_X = -6;
const TRACK_CAREER_X = 6;
const TRACK_AI_X = 0;
const HOUSE_Z = 34;
const INTRO_RING = 8;

const palette = {
  grass: "#75e2a1",
  moss: "#2e4638",
  sand: "#f0d9a3",
  water: "#5fd0ff",
  wood: "#d9a66f",
  border: "#7b5a35",
  stone: "#2f3c3a",
  light: "#f97316",
};

type ProjectNode = {
  id: "p1" | "p2" | "p3" | "p4";
  z: number;
  title: string;
  teaser: string;
  links?: { label: string; href: string }[];
  triggerRadius: number;
};

type CareerNode = {
  id: "c1" | "c2" | "c3" | "c4";
  z: number;
  title: string;
  subtitle: string;
  triggerRadius: number;
};

const projects: ProjectNode[] = [
  { id: "p1", z: 12, title: "Projekt 1", teaser: "Ops & Systeme", triggerRadius: 5 },
  { id: "p2", z: 32, title: "Projekt 2", teaser: "Frontend UX", triggerRadius: 5 },
  { id: "p3", z: 52, title: "Projekt 3", teaser: "Realtime / 3D", triggerRadius: 5 },
  { id: "p4", z: 72, title: "Projekt 4", teaser: "Automation", triggerRadius: 5 },
];

const career: CareerNode[] = [
  { id: "c1", z: 14, title: "2015–2017", subtitle: "Einstieg / Delivery", triggerRadius: 5 },
  { id: "c2", z: 34, title: "2018–2020", subtitle: "Verantwortung", triggerRadius: 5 },
  { id: "c3", z: 54, title: "2021–2023", subtitle: "Systems / Lead", triggerRadius: 5 },
  { id: "c4", z: 74, title: "Heute", subtitle: "Fokus & Coaching", triggerRadius: 5 },
];

const aiMarker = { z: 26, title: "AI-Dock", teaser: "Lab & Tools" };

function seededRandom(cx: number, cz: number, salt = 1) {
  let seed = Math.imul(cx, 374761393) ^ Math.imul(cz, 668265263) ^ Math.imul(salt, 982451653);
  seed = (seed ^ (seed >> 13)) >>> 0;
  seed = Math.imul(seed, 1274126177);
  return (seed >>> 0) / 4294967295;
}

function createBillboard(text: string, color: string, scale = new THREE.Vector2(3.1, 1.4)) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context missing");
  ctx.fillStyle = "rgba(4,8,14,0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = "800 80px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.97 });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scale.x, scale.y, 1);
  sprite.position.y = 1.6;
  return { sprite, mat, tex, dispose: () => { mat.dispose(); tex.dispose(); canvas.remove(); } };
}

type ChunkEntry = {
  cx: number;
  cz: number;
  group: THREE.Group;
  tick: (t: number, progress: number, player: THREE.Vector3) => void;
  dispose: () => void;
};

function createChunk(cx: number, cz: number): ChunkEntry {
  const group = new THREE.Group();
  group.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);
  const disposers: Array<() => void> = [];
  const tickers: Array<(t: number, progress: number, player: THREE.Vector3) => void> = [];

  const seed = seededRandom(cx, cz);
  const terrainHeight = 0.5 + 0.9 * Math.sin((cx + cz) * 0.35) + 0.6 * Math.cos(cz * 0.55) + 0.45 * seed;
  const plateGeo = new THREE.BoxGeometry(CHUNK_SIZE, 0.55, CHUNK_SIZE);
  const plateMat = new THREE.MeshStandardMaterial({ color: palette.grass, roughness: 0.5, metalness: 0.08 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.3 + terrainHeight * 0.18;
  plate.receiveShadow = true;
  plate.castShadow = true;
  group.add(plate);

  const rimGeo = new THREE.BoxGeometry(CHUNK_SIZE - 1.4, 0.1, CHUNK_SIZE - 1.4);
  const rimMat = new THREE.MeshStandardMaterial({ color: palette.moss, roughness: 0.82 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = plate.position.y + 0.32;
  rim.castShadow = true;
  rim.receiveShadow = true;
  group.add(rim);

  const undersideGeo = new THREE.ConeGeometry(CHUNK_SIZE * 0.55, CHUNK_SIZE * 0.85, 7, 1, true);
  const undersideMat = new THREE.MeshStandardMaterial({ color: palette.stone, roughness: 0.9, side: THREE.DoubleSide });
  const underside = new THREE.Mesh(undersideGeo, undersideMat);
  underside.position.y = -2.1 + terrainHeight * 0.18;
  underside.castShadow = true;
  group.add(underside);

  if (seed > 0.38 && seed < 0.74) {
    const waterGeo = new THREE.CircleGeometry(3 + seed * 1.5, 26);
    const waterMat = new THREE.MeshStandardMaterial({
      color: palette.water,
      roughness: 0.2,
      metalness: 0.12,
      transparent: true,
      opacity: 0.78,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(1.2 - seed * 2.4, plate.position.y + 0.31, -0.6 + seed * 1.3);
    water.receiveShadow = true;
    group.add(water);
    disposers.push(() => {
      waterGeo.dispose();
      waterMat.dispose();
    });
  }

  const pebbleGeo = new THREE.DodecahedronGeometry(0.32, 0);
  const pebbleMat = new THREE.MeshStandardMaterial({ color: palette.stone, roughness: 0.86 });
  for (let i = 0; i < 12; i++) {
    const r = seededRandom(cx + i, cz - i, 33 + i);
    const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
    pebble.position.set(
      (r - 0.5) * (CHUNK_SIZE - 3),
      plate.position.y + 0.32,
      (seededRandom(cx * 3 + i, cz * 2 - i, 92) - 0.5) * (CHUNK_SIZE - 3),
    );
    pebble.rotation.y = seededRandom(cx - i, cz + i, 8088) * Math.PI * 2;
    pebble.castShadow = true;
    pebble.receiveShadow = true;
    group.add(pebble);
  }
  disposers.push(() => {
    plateGeo.dispose();
    plateMat.dispose();
    rimGeo.dispose();
    rimMat.dispose();
    undersideGeo.dispose();
    undersideMat.dispose();
    pebbleGeo.dispose();
    pebbleMat.dispose();
  });

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.4, 8);
  const canopyGeo = new THREE.ConeGeometry(1.05, 1.7, 8, 1, false);
  const trunkMat = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.62, metalness: 0.06 });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: "#63f3c4",
    roughness: 0.42,
    emissive: new THREE.Color("#63f3c4"),
    emissiveIntensity: 0.1,
  });
  const makeTree = (px: number, pz: number, scale = 1) => {
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(px, 0.7 * scale, pz);
    trunk.scale.setScalar(scale);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(px, 1.6 * scale, pz);
    canopy.scale.setScalar(scale * (0.9 + seededRandom(px, pz, 44) * 0.18));
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);
  };

  for (let i = 0; i < 9; i++) {
    const rx = seededRandom(cx + i, cz - i, 772) - 0.5;
    const rz = seededRandom(cx - i, cz + i, 227) - 0.5;
    const px = rx * (CHUNK_SIZE - 4);
    const pz = rz * (CHUNK_SIZE - 4);
    const nearTrack =
      Math.abs(px - TRACK_PROJECT_X) < 2 ||
      Math.abs(px - TRACK_CAREER_X) < 2 ||
      Math.abs(px - TRACK_AI_X) < 1.6;
    if (nearTrack) continue;
    makeTree(px, pz, 0.8 + seededRandom(cx * i, cz + i, 99) * 0.4);
  }
  disposers.push(() => {
    trunkGeo.dispose();
    canopyGeo.dispose();
    trunkMat.dispose();
    canopyMat.dispose();
  });

  const trackGeo = new THREE.BoxGeometry(1.25, 0.14, 1.25);
  const trackMatProjects = new THREE.MeshStandardMaterial({
    color: palette.wood,
    roughness: 0.48,
    metalness: 0.1,
    emissive: new THREE.Color(palette.wood),
    emissiveIntensity: 0.06,
  });
  const trackMatCareer = new THREE.MeshStandardMaterial({ color: palette.sand, roughness: 0.45, metalness: 0.08 });
  const trackMatAi = new THREE.MeshStandardMaterial({
    color: "#9dd8ff",
    roughness: 0.4,
    metalness: 0.2,
    emissive: new THREE.Color("#9dd8ff"),
    emissiveIntensity: 0.16,
  });
  const borderGeo = new THREE.BoxGeometry(0.3, 0.36, 1.25);
  const borderMat = new THREE.MeshStandardMaterial({ color: palette.border, roughness: 0.55, metalness: 0.1 });
  for (let z = -CHUNK_SIZE / 2; z <= CHUNK_SIZE / 2; z += 1.5) {
    const tileL = new THREE.Mesh(trackGeo, trackMatProjects);
    tileL.position.set(TRACK_PROJECT_X, 0, z);
    tileL.receiveShadow = true;
    tileL.castShadow = true;
    group.add(tileL);

    const tileLBorderL = new THREE.Mesh(borderGeo, borderMat);
    tileLBorderL.position.set(TRACK_PROJECT_X - 0.75, 0.08, z);
    tileLBorderL.castShadow = true;
    tileLBorderL.receiveShadow = true;
    group.add(tileLBorderL);

    const tileLBorderR = new THREE.Mesh(borderGeo, borderMat);
    tileLBorderR.position.set(TRACK_PROJECT_X + 0.75, 0.08, z);
    tileLBorderR.castShadow = true;
    tileLBorderR.receiveShadow = true;
    group.add(tileLBorderR);

    const tileR = new THREE.Mesh(trackGeo, trackMatCareer);
    tileR.position.set(TRACK_CAREER_X, 0, z);
    tileR.receiveShadow = true;
    tileR.castShadow = true;
    group.add(tileR);

    const tileRBorderL = new THREE.Mesh(borderGeo, borderMat);
    tileRBorderL.position.set(TRACK_CAREER_X - 0.75, 0.08, z);
    tileRBorderL.castShadow = true;
    tileRBorderL.receiveShadow = true;
    group.add(tileRBorderL);

    const tileRBorderR = new THREE.Mesh(borderGeo, borderMat);
    tileRBorderR.position.set(TRACK_CAREER_X + 0.75, 0.08, z);
    tileRBorderR.castShadow = true;
    tileRBorderR.receiveShadow = true;
    group.add(tileRBorderR);

    const aiTile = new THREE.Mesh(trackGeo, trackMatAi);
    aiTile.scale.set(0.9, 1, 0.9);
    aiTile.position.set(TRACK_AI_X, 0, z + 0.4);
    aiTile.receiveShadow = true;
    aiTile.castShadow = true;
    group.add(aiTile);
  }
  disposers.push(() => {
    trackGeo.dispose();
    trackMatProjects.dispose();
    trackMatCareer.dispose();
    trackMatAi.dispose();
    borderGeo.dispose();
    borderMat.dispose();
  });

  const chunkMin = cz * CHUNK_SIZE - CHUNK_SIZE / 2;
  const chunkMax = chunkMin + CHUNK_SIZE;

  const makeNode = (x: number, zWorld: number, title: string, subtitle: string, color: string, radius: number) => {
    const localZ = zWorld - cz * CHUNK_SIZE;
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.3, 28),
      new THREE.MeshStandardMaterial({ color: "#0e1519", roughness: 0.7, metalness: 0.12 }),
    );
    pad.position.set(x, 0.15, localZ);
    pad.receiveShadow = true;
    group.add(pad);

    const glow = new THREE.PointLight(color, 0.9, 9, 2);
    glow.position.set(x, 2, localZ);
    group.add(glow);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 1.4, 16),
      new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: 0.55, roughness: 0.4 }),
    );
    stem.position.set(x, 1, localZ);
    group.add(stem);

    const label = createBillboard(title, color, new THREE.Vector2(2.9, 1.1));
    label.sprite.position.set(x, 1.9, localZ);
    group.add(label.sprite);

    const mini = createBillboard(subtitle, "#a8c7ff", new THREE.Vector2(2.4, 0.8));
    mini.sprite.position.set(x, 1.15, localZ);
    mini.sprite.material.opacity = 0.88;
    group.add(mini.sprite);

    disposers.push(() => {
      (pad.geometry as THREE.CylinderGeometry).dispose();
      (pad.material as THREE.Material).dispose();
      (stem.geometry as THREE.CylinderGeometry).dispose();
      (stem.material as THREE.Material).dispose();
      glow.dispose();
      label.dispose();
      mini.dispose();
    });

    tickers.push((t, progress, player) => {
      const dist = Math.abs(progress - zWorld);
      const close = dist < radius && Math.abs(player.x - x) < 3.4;
      const pulse = THREE.MathUtils.clamp(1 - dist / radius, 0, 1);
      glow.intensity = 0.8 + 0.8 * pulse;
      label.sprite.material.opacity = 0.82 + 0.18 * pulse;
      label.sprite.position.y = 1.9 + 0.06 * Math.sin(t / 260);
      mini.sprite.position.y = 1.15 + 0.05 * Math.sin(t / 190);
      (mini.sprite.material as THREE.SpriteMaterial).opacity = close ? 0.95 : 0.75;
    });
  };

  projects
    .filter((p) => p.z >= chunkMin && p.z < chunkMax)
    .forEach((p) => makeNode(TRACK_PROJECT_X, p.z, p.title, p.teaser, "#5cf2ac", p.triggerRadius));

  career
    .filter((c) => c.z >= chunkMin && c.z < chunkMax)
    .forEach((c) => makeNode(TRACK_CAREER_X, c.z, c.title, c.subtitle, "#f7ba72", c.triggerRadius));

  if (aiMarker.z >= chunkMin && aiMarker.z < chunkMax) {
    makeNode(TRACK_AI_X, aiMarker.z, aiMarker.title, aiMarker.teaser, "#6fa0ff", 4.5);
  }

  if (HOUSE_Z >= chunkMin && HOUSE_Z < chunkMax) {
    const localZ = HOUSE_Z - cz * CHUNK_SIZE;
    const house = new THREE.Group();
    house.position.set(TRACK_PROJECT_X - 2.4, 0, localZ);

    const baseGeo = new THREE.BoxGeometry(2.6, 0.35, 2.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: "#f8eedf", roughness: 0.58, metalness: 0.04 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    base.castShadow = true;
    house.add(base);

    const towerGeo = new THREE.BoxGeometry(1.9, 1.8, 1.9);
    const towerMat = new THREE.MeshStandardMaterial({ color: "#f3dfc4", roughness: 0.45, metalness: 0.06 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 1.2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    house.add(tower);

    const roofGeo = new THREE.ConeGeometry(1.45, 0.9, 6);
    const roofMat = new THREE.MeshStandardMaterial({ color: palette.light, roughness: 0.35, metalness: 0.12 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.25;
    roof.castShadow = true;
    roof.receiveShadow = true;
    house.add(roof);

    const dockGeo = new THREE.BoxGeometry(2.8, 0.16, 1.6);
    const dockMat = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.55, metalness: 0.08 });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.set(-0.2, 0.05, 1.75);
    dock.castShadow = true;
    dock.receiveShadow = true;
    house.add(dock);

    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: palette.border, roughness: 0.55, metalness: 0.08 });
    const mkPost = (x: number, z: number) => {
      const p = new THREE.Mesh(postGeo, postMat);
      p.position.set(x, 0.4, z);
      p.castShadow = true;
      p.receiveShadow = true;
      house.add(p);
    };
    mkPost(-0.9, 2.5);
    mkPost(1.1, 2.4);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), postMat);
    flag.position.set(0.95, 2.05, -0.4);
    flag.castShadow = true;
    house.add(flag);

    const banner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.5), roofMat);
    banner.position.set(0.95, 2.25, -0.7);
    banner.castShadow = true;
    house.add(banner);

    const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 8, 18), new THREE.MeshStandardMaterial({ color: "#8cc8ff" }));
    buoy.position.set(1, 1.2, 0.65);
    buoy.rotation.x = Math.PI / 2;
    buoy.castShadow = true;
    house.add(buoy);

    const lamp = new THREE.PointLight(palette.light, 1.8, 6, 2);
    lamp.position.set(0.2, 2.4, 0.2);
    house.add(lamp);

    group.add(house);

    disposers.push(() => {
      baseGeo.dispose();
      baseMat.dispose();
      towerGeo.dispose();
      towerMat.dispose();
      roofGeo.dispose();
      roofMat.dispose();
      dockGeo.dispose();
      dockMat.dispose();
      postGeo.dispose();
      postMat.dispose();
      (flag.geometry as THREE.BufferGeometry).dispose();
      (flag.material as THREE.Material).dispose();
      (banner.geometry as THREE.BufferGeometry).dispose();
      (banner.material as THREE.Material).dispose();
      (buoy.geometry as THREE.TorusGeometry).dispose();
      (buoy.material as THREE.Material).dispose();
      lamp.dispose();
    });
  }

  const reedGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.2, 6);
  const reedMat = new THREE.MeshStandardMaterial({ color: "#49d88f", roughness: 0.46, emissive: new THREE.Color("#49d88f"), emissiveIntensity: 0.08 });
  for (let i = 0; i < 8; i++) {
    const reed = new THREE.Mesh(reedGeo, reedMat);
    reed.position.set(
      -5 + seededRandom(cx + i, cz - i, 987) * 10,
      0.6 + seededRandom(cx - i, cz + i, 18) * 0.2,
      -CHUNK_SIZE / 2 + (i / 7) * CHUNK_SIZE,
    );
    reed.rotation.y = Math.PI * seededRandom(cx - i, cz + i, 777);
    reed.castShadow = true;
    reed.receiveShadow = true;
    group.add(reed);
  }
  disposers.push(() => {
    reedGeo.dispose();
    reedMat.dispose();
  });

  return {
    cx,
    cz,
    group,
    tick: (t, progress, player) => tickers.forEach((fn) => fn(t, progress, player)),
    dispose: () => {
      disposers.forEach((fn) => fn());
    },
  };
}

export function createHubScene(player: Player): ManagedScene {
  const scene = new THREE.Scene();
  const SKY = new THREE.Color("#bff2ff");
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 10, 96);

  scene.add(new THREE.AmbientLight(0xffffff, 0.86));
  const hemi = new THREE.HemisphereLight(0xe7f6ff, 0x27443a, 0.78);
  hemi.position.set(0, 22, 0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe9c3, 1.72);
  sun.position.set(-12, 19, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.far = 120;
  scene.add(sun);

  const bounce = new THREE.DirectionalLight(0xa2d8ff, 0.46);
  bounce.position.set(14, 11, -12);
  scene.add(bounce);

  const avatar = createAvatar();
  avatar.group.scale.setScalar(0.5);
  scene.add(avatar.group);

  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const flow = new OrganicFlow({
    count: 180,
    center: new THREE.Vector3(0, 1.2, 0),
    radius: 3.4,
    color: 0x4e9cff,
    size: 0.06,
    opacity: 0.34,
  });
  worldRoot.add(flow.points);

  const chunkMap = new Map<string, ChunkEntry>();

  const ensureChunks = (centerX: number, centerZ: number) => {
    for (let dx = -ACTIVE_RADIUS; dx <= ACTIVE_RADIUS; dx++) {
      for (let dz = -ACTIVE_RADIUS; dz <= ACTIVE_RADIUS; dz++) {
        const cx = centerX + dx;
        const cz = centerZ + dz;
        const key = `${cx}:${cz}`;
        if (!chunkMap.has(key)) {
          const entry = createChunk(cx, cz);
          chunkMap.set(key, entry);
          worldRoot.add(entry.group);
        }
      }
    }

    for (const [key, entry] of chunkMap.entries()) {
      if (Math.abs(entry.cx - centerX) > ACTIVE_RADIUS || Math.abs(entry.cz - centerZ) > ACTIVE_RADIUS) {
        worldRoot.remove(entry.group);
        entry.dispose();
        chunkMap.delete(key);
      }
    }
  };

  const resetChunks = () => {
    for (const [, entry] of chunkMap.entries()) {
      worldRoot.remove(entry.group);
      entry.dispose();
    }
    chunkMap.clear();
  };

  player.position.set(0, 0, 0);
  worldRoot.position.set(0, 0, 0);
  let progress = 0;

  const applyAnchor = (anchor: "intro" | "projects" | "career" | "ai") => {
    const anchorMap: Record<"intro" | "projects" | "career" | "ai", { progress: number; x: number }> = {
      intro: { progress: 0, x: 0 },
      projects: { progress: projects[0].z - 2, x: TRACK_PROJECT_X },
      career: { progress: career[0].z - 2, x: TRACK_CAREER_X },
      ai: { progress: aiMarker.z - 1, x: TRACK_AI_X },
    };
    const target = anchorMap[anchor];
    player.position.set(target.x, 0, 0);
    progress = target.progress;
    worldRoot.position.z = progress;
    resetChunks();
  };

  applyAnchor("intro");

  let wind = 0.32;

  return {
    key: "hub",
    scene,
    tick: (t: number, dt: number) => {
      progress -= player.position.z;
      player.position.z = 0;
      worldRoot.position.z = progress;

      const chunkX = Math.floor(player.position.x / CHUNK_SIZE);
      const chunkZ = Math.floor(progress / CHUNK_SIZE);
      ensureChunks(chunkX, chunkZ);

      const nearCore = progress < INTRO_RING && Math.abs(player.position.x) < 4;
      const targetWind = nearCore ? 0.85 : 0.32;
      wind = lerp(wind, targetWind, 0.06);

      flow.update(
        t,
        wind,
        nearCore ? player.position.clone().add(new THREE.Vector3(0, 1, 0)) : player.position.clone(),
      );
      chunkMap.forEach((entry) => entry.tick(t, progress, player.position));
      avatar.update(player, t);
      sun.intensity = 1.28 + 0.26 * wind;
    },
    getCamera: () => {
      const parallax = new THREE.Vector3(
        THREE.MathUtils.clamp(player.position.x * 0.22, -2.6, 2.6),
        0,
        THREE.MathUtils.clamp(progress * 0.012, -1.1, 2.4),
      );
      const anchor = new THREE.Vector3(0, 11.8, 14.6);
      const camPos = anchor.clone().add(parallax);
      const look = new THREE.Vector3(player.position.x * 0.58, 1.55, -1 + Math.min(progress, 48) * 0.01);
      return { camPos, look };
    },
    setAnchor: (anchor) => {
      applyAnchor(anchor);
    },
    dispose: () => {
      flow.dispose();
      avatar.dispose();
      resetChunks();
    },
  };
}
