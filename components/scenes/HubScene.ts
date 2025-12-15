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
  const terrainHeight = 0.4 + 0.8 * Math.sin((cx + cz) * 0.4) + 0.6 * Math.cos(cz * 0.7) + 0.4 * seed;
  const groundGeo = new THREE.BoxGeometry(CHUNK_SIZE, 0.35, CHUNK_SIZE);
  const groundMat = new THREE.MeshStandardMaterial({ color: "#1c282f", roughness: 0.9 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.4 + terrainHeight * 0.2;
  ground.receiveShadow = true;
  group.add(ground);
  disposers.push(() => {
    groundGeo.dispose();
    groundMat.dispose();
  });

  const undersideGeo = new THREE.ConeGeometry(CHUNK_SIZE * 0.5, CHUNK_SIZE * 0.8, 24, 1, true);
  const undersideMat = new THREE.MeshStandardMaterial({ color: "#0c1014", roughness: 0.92, side: THREE.DoubleSide });
  const underside = new THREE.Mesh(undersideGeo, undersideMat);
  underside.position.y = -2.4 + terrainHeight * 0.2;
  underside.castShadow = true;
  group.add(underside);
  disposers.push(() => {
    undersideGeo.dispose();
    undersideMat.dispose();
  });

  const scatterGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const scatterMat = new THREE.MeshStandardMaterial({ color: "#0f161b", roughness: 0.8 });
  for (let i = 0; i < 12; i++) {
    const r = seededRandom(cx + i, cz - i, 33 + i);
    const shard = new THREE.Mesh(scatterGeo, scatterMat);
    shard.position.set(
      (r - 0.5) * (CHUNK_SIZE - 2),
      0.3 + 0.6 * seededRandom(cx - i, cz + i, 123),
      (seededRandom(cx * 3 + i, cz * 2 - i, 92) - 0.5) * (CHUNK_SIZE - 2),
    );
    const rotSeed = seededRandom(cx - i, cz + i, 8088);
    shard.rotation.set(rotSeed * Math.PI, rotSeed * Math.PI * 0.6, rotSeed * Math.PI * 1.2);
    shard.castShadow = true;
    shard.receiveShadow = true;
    group.add(shard);
  }
  disposers.push(() => {
    scatterGeo.dispose();
    scatterMat.dispose();
  });

  const trackGeo = new THREE.BoxGeometry(1.2, 0.12, 1.2);
  const trackMatProjects = new THREE.MeshStandardMaterial({ color: "#20313a", roughness: 0.6, metalness: 0.08 });
  const trackMatCareer = new THREE.MeshStandardMaterial({ color: "#2b2b1f", roughness: 0.6, metalness: 0.08 });
  const trackMatAi = new THREE.MeshStandardMaterial({ color: "#1b2636", roughness: 0.55, metalness: 0.12 });
  for (let z = -CHUNK_SIZE / 2; z <= CHUNK_SIZE / 2; z += 1.5) {
    const tileL = new THREE.Mesh(trackGeo, trackMatProjects);
    tileL.position.set(TRACK_PROJECT_X, 0, z);
    tileL.receiveShadow = true;
    tileL.castShadow = true;
    group.add(tileL);

    const tileR = new THREE.Mesh(trackGeo, trackMatCareer);
    tileR.position.set(TRACK_CAREER_X, 0, z);
    tileR.receiveShadow = true;
    tileR.castShadow = true;
    group.add(tileR);

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

  const streamGeo = new THREE.BoxGeometry(0.35, 1.1, 0.35);
  const streamMat = new THREE.MeshStandardMaterial({ color: "#12202a", roughness: 0.7, metalness: 0.08 });
  for (let i = 0; i < 6; i++) {
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.position.set(
      -5 + seededRandom(cx + i, cz - i, 987) * 10,
      0.7,
      -CHUNK_SIZE / 2 + (i / 5) * CHUNK_SIZE,
    );
    stream.rotation.y = Math.PI * seededRandom(cx - i, cz + i, 777);
    stream.castShadow = true;
    stream.receiveShadow = true;
    group.add(stream);
  }
  disposers.push(() => {
    streamGeo.dispose();
    streamMat.dispose();
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
  const SKY = new THREE.Color("#a7d2ff");
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 18, 95);

  scene.add(new THREE.AmbientLight(0xffffff, 0.92));
  const hemi = new THREE.HemisphereLight(0xe8f6ff, 0x243022, 0.72);
  hemi.position.set(0, 18, 0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-14, 18, 13);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const avatar = createAvatar();
  avatar.group.scale.setScalar(0.5);
  scene.add(avatar.group);

  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const flow = new OrganicFlow({
    count: 180,
    center: new THREE.Vector3(0, 1.2, 0),
    radius: 3.4,
    color: 0x3b7eff,
    size: 0.06,
    opacity: 0.38,
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

  const applyAnchor = (anchor: "intro" | "projects" | "career" | "ai") => {
    const anchorMap: Record<"intro" | "projects" | "career" | "ai", { progress: number; x: number }> = {
      intro: { progress: 0, x: 0 },
      projects: { progress: projects[0].z - 2, x: TRACK_PROJECT_X },
      career: { progress: career[0].z - 2, x: TRACK_CAREER_X },
      ai: { progress: aiMarker.z - 1, x: TRACK_AI_X },
    };
    const target = anchorMap[anchor];
    player.position.set(target.x, 0, 0);
    worldRoot.position.z = target.progress + player.position.z;
    resetChunks();
  };

  applyAnchor("intro");

  let wind = 0.32;

  return {
    key: "hub",
    scene,
    tick: (t: number, dt: number) => {
      const threshold = CHUNK_SIZE * 0.35;
      if (player.position.z < -threshold) {
        player.position.z += CHUNK_SIZE;
        worldRoot.position.z += CHUNK_SIZE;
      } else if (player.position.z > threshold) {
        player.position.z -= CHUNK_SIZE;
        worldRoot.position.z -= CHUNK_SIZE;
      }

      const progressZ = worldRoot.position.z - player.position.z;
      const chunkX = Math.floor(player.position.x / CHUNK_SIZE);
      const chunkZ = Math.floor(progressZ / CHUNK_SIZE);
      ensureChunks(chunkX, chunkZ);

      const nearCore = progressZ < 8 && Math.abs(player.position.x) < 4;
      const targetWind = nearCore ? 0.85 : 0.28;
      wind = lerp(wind, targetWind, 0.06);

      flow.update(t, wind, nearCore ? player.position.clone().add(new THREE.Vector3(0, 1, 0)) : null);
      chunkMap.forEach((entry) => entry.tick(t, progressZ, player.position));
      avatar.update(player, t);
      sun.intensity = 1.2 + 0.3 * wind;
    },
    getCamera: () => {
      const parallax = player.position.clone().multiplyScalar(0.18);
      parallax.x = THREE.MathUtils.clamp(parallax.x, -2.2, 2.2);
      parallax.z = THREE.MathUtils.clamp(parallax.z, -2.2, 2.2);
      const anchor = new THREE.Vector3(0, 11.6, 14.8);
      const camPos = anchor.clone().add(new THREE.Vector3(parallax.x, 0, parallax.z));
      const look = new THREE.Vector3(player.position.x * 0.55, 0.9, player.position.z - 1.6);
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
