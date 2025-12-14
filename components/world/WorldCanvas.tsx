"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SceneManager } from "./SceneManager";
import { Player } from "./Player";
import { Input } from "./Input";
import { clamp, smoothstep } from "@/lib/math";
import { SceneKey } from "@/lib/state";

interface WorldCanvasProps {
  onHudChange: (text: string) => void;
  onBubble: (text: string) => void;
  onProof: (v: boolean) => void;
}

export function WorldCanvas({ onHudChange, onBubble, onProof }: WorldCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const rafRef = useRef<number | null>(null);
  const input = useRef(new Input());
  const player = useRef(new Player());
  const fadeRef = useRef(0);

  useEffect(() => {
    if (!hostRef.current) return;

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

    const startTeleport = (to: SceneKey) => {
      const start = performance.now();
      const durOut = 320;
      const durIn = 420;

      const step = (time: number) => {
        const elapsed = time - start;
        if (elapsed < durOut) {
          const p = clamp(elapsed / durOut, 0, 1);
          const a = smoothstep(0, 1, p);
          fadeRef.current = a;
          onHudChange("Teleport wird vorbereitet…");
          requestAnimationFrame(step);
          return;
        }

        sceneManager.switchScene(to);
        const startIn = performance.now();
        const stepIn = (tt: number) => {
          const e2 = tt - startIn;
          const p = clamp(e2 / durIn, 0, 1);
          const a = 1 - smoothstep(0, 1, p);
          fadeRef.current = a;
          if (p < 1) requestAnimationFrame(stepIn);
        };
        requestAnimationFrame(stepIn);
      };

      requestAnimationFrame(step);
    };

    const clock = new THREE.Clock();
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.033);
      const t = performance.now() / 1000;
      const keys = inputManager.snapshot();

        if (keys["Enter"] && sceneManager.sceneKey === "hub" && fadeRef.current < 0.02) {
          keys["Enter"] = false;
          startTeleport("ai");
          onBubble("[INFO] Teleport → AI Room");
        }
        if ((keys["Backspace"] || keys["Escape"]) && sceneManager.sceneKey === "ai" && fadeRef.current < 0.02) {
          startTeleport("hub");
          onBubble("[INFO] Zurück zum Systems Hub");
        }

      sceneManager.update(keys, t, dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    onHudChange("Hub: WASD/Pfeile bewegen • Shift Sprint • Enter AI Room");

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      inputManager.detach();
      sceneManager.switchScene("hub");
      managerRef.current = null;
      renderer.dispose();
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, [onBubble, onHudChange, onProof]);

  return <div ref={hostRef} className="canvas-host" />;
}
