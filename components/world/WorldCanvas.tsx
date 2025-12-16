"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SceneManager } from "./SceneManager";
import { Player } from "./Player";
import { Input } from "./Input";
import { AmbientAudio } from "./AmbientAudio";

interface WorldCanvasProps {
  onHudChange: (text: string) => void;
  onBubble: (text: string) => void;
  onProof: (v: boolean) => void;
  onInputReady?: (input: Input) => void;
  muted: boolean;
  onAnchorReady?: (api: AnchorApi | null) => void;
}

export type AnchorApi = {
  goIntro: () => void;
  goProjects: () => void;
  goCareer: () => void;
};

export function WorldCanvas({ onHudChange, onBubble, onProof, onInputReady, muted, onAnchorReady }: WorldCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const rafRef = useRef<number | null>(null);
  const input = useRef(new Input());
  const player = useRef(new Player());
  const fadeRef = useRef(0);
  const vignetteRef = useRef<HTMLDivElement | null>(null);
  const fadeLayerRef = useRef<HTMLDivElement | null>(null);
  const overlayRaf = useRef<number | null>(null);
  const ambience = useRef(new AmbientAudio());
  const hudRef = useRef(onHudChange);
  const bubbleRef = useRef(onBubble);
  const proofRef = useRef(onProof);
  const anchorRef = useRef(onAnchorReady);
  const inputReadyRef = useRef(onInputReady);

  useEffect(() => {
    hudRef.current = onHudChange;
  }, [onHudChange]);

  useEffect(() => {
    bubbleRef.current = onBubble;
  }, [onBubble]);

  useEffect(() => {
    proofRef.current = onProof;
  }, [onProof]);

  useEffect(() => {
    anchorRef.current = onAnchorReady;
  }, [onAnchorReady]);

  useEffect(() => {
    inputReadyRef.current = onInputReady;
  }, [onInputReady]);

  useEffect(() => {
    if (!hostRef.current) return;

    const ambient = ambience.current;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    hostRef.current.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

    const resize = () => {
      const w = hostRef.current?.clientWidth || window.innerWidth;
      const h = hostRef.current?.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const sceneManager = new SceneManager(renderer, camera, player.current);
    managerRef.current = sceneManager;
    const inputManager = input.current;
    inputManager.attach();
    inputReadyRef.current?.(inputManager);
    anchorRef.current?.({
      goIntro: () => managerRef.current?.jumpToAnchor("intro"),
      goProjects: () => managerRef.current?.jumpToAnchor("projects"),
      goCareer: () => managerRef.current?.jumpToAnchor("career"),
    });

    const clock = new THREE.Clock();
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.033);
      const t = performance.now() / 1000;
      const keys = inputManager.snapshot();

      if (keys["Digit1"]) {
        managerRef.current?.jumpToAnchor("projects");
        keys["Digit1"] = false;
        bubbleRef.current?.("[INFO] Links zum Projektpfad (Taste 1)");
      }
      if (keys["Digit2"]) {
        managerRef.current?.jumpToAnchor("career");
        keys["Digit2"] = false;
        bubbleRef.current?.("[INFO] Rechts zur Karriere-Terrasse (Taste 2)");
        proofRef.current?.(true);
      }
      if (keys["Digit3"]) {
        managerRef.current?.jumpToAnchor("intro");
        keys["Digit3"] = false;
        bubbleRef.current?.("[INFO] Zurück zum Startplateau (Taste 3)");
      }

      ambient.setMovementSpeed(player.current.velocity.length());
      sceneManager.update(keys, t, dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const overlayStep = () => {
      if (vignetteRef.current) {
        vignetteRef.current.style.setProperty("--fade", fadeRef.current.toFixed(3));
      }
      if (fadeLayerRef.current) {
        fadeLayerRef.current.style.setProperty("--fade", fadeRef.current.toFixed(3));
      }
      overlayRaf.current = requestAnimationFrame(overlayStep);
    };
    overlayStep();

    hudRef.current(
      "Schwebe-Insel: Immer nach vorne laufen • WASD/Pfeile • Shift Sprint • 1 Projekte (links) • 2 Karriere (rechts) • 3 Startplateau",
    );

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (overlayRaf.current) cancelAnimationFrame(overlayRaf.current);
      inputManager.detach();
      sceneManager.switchScene("hub");
      managerRef.current = null;
      renderer.dispose();
      ambient.dispose();
      window.removeEventListener("resize", resize);
      canvas.remove();
      anchorRef.current?.(null);
    };
  }, []);

  useEffect(() => {
    const ambient = ambience.current;
    if (!muted) {
      ambient.resume();
    }
    ambient.setMuted(muted);
  }, [muted]);

  return (
    <div ref={hostRef} className="canvas-host">
      <div ref={fadeLayerRef} className="fade-layer" />
      <div ref={vignetteRef} className="vignette-mask" />
    </div>
  );
}
