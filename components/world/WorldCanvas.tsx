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
}

export function WorldCanvas({ onHudChange, onBubble, onProof, onInputReady, muted }: WorldCanvasProps) {
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
    onInputReady?.(inputManager);

    const clock = new THREE.Clock();
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.033);
      const t = performance.now() / 1000;
      const keys = inputManager.snapshot();

      if (keys["Digit1"]) {
        managerRef.current?.jumpToAnchor("projects");
        keys["Digit1"] = false;
        onBubble("[INFO] Links zum Projektpfad (Taste 1)");
      }
      if (keys["Digit2"]) {
        managerRef.current?.jumpToAnchor("career");
        keys["Digit2"] = false;
        onBubble("[INFO] Rechts zur Karriere-Terrasse (Taste 2)");
        onProof(true);
      }
      if (keys["Digit3"]) {
        managerRef.current?.jumpToAnchor("intro");
        keys["Digit3"] = false;
        onBubble("[INFO] Zurück zum Startplateau (Taste 3)");
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

    onHudChange("Insel-Welt: WASD/Pfeile • Shift Sprint • 1 Projekte • 2 Karriere • 3 Startplateau");

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
    };
  }, [onBubble, onHudChange, onInputReady, onProof]);

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
