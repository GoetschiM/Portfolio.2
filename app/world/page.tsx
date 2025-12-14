"use client";

import { WorldCanvas } from "@/components/world/WorldCanvas";
import HUD from "@/components/ui/HUD";
import BubbleHUD from "@/components/ui/BubbleHUD";
import ProofPanel from "@/components/ui/ProofPanel";
import { useState } from "react";

export default function WorldPage() {
  const [hud, setHud] = useState("WASD / Pfeile bewegen • Shift Sprint • Enter Teleport");
  const [bubbles, setBubbles] = useState<string[]>([]);
  const [showProof, setShowProof] = useState(false);

  return (
    <div className="canvas-host">
      <WorldCanvas onHudChange={setHud} onBubble={(b) => setBubbles((prev) => [b, ...prev].slice(0, 5))} onProof={setShowProof} />
      <div className="overlay" style={{ padding: 18 }}>
        <HUD text={hud} />
        <BubbleHUD bubbles={bubbles} />
        {showProof && <ProofPanel onClose={() => setShowProof(false)} />}
      </div>
    </div>
  );
}
