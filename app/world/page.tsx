"use client";

import { useState } from "react";
import { WorldCanvas } from "@/components/world/WorldCanvas";
import HUD from "@/components/ui/HUD";
import BubbleHUD from "@/components/ui/BubbleHUD";
import ProofPanel from "@/components/ui/ProofPanel";
import TouchControls from "@/components/ui/TouchControls";
import { Input } from "@/components/world/Input";

export default function WorldPage() {
  const [hud, setHud] = useState(
    "Chunk-Hub: WASD/Pfeile • Shift Sprint • Enter AI-Raum • 1 Projekte • 2 Karriere • 3 AI-Dock • 4 Start",
  );
  const [bubbles, setBubbles] = useState<string[]>([]);
  const [showProof, setShowProof] = useState(false);
  const [input, setInput] = useState<Input | null>(null);

  return (
    <div className="canvas-host">
      <WorldCanvas
        onHudChange={setHud}
        onBubble={(b) => setBubbles((prev) => [b, ...prev].slice(0, 5))}
        onProof={setShowProof}
        onInputReady={setInput}
      />
      <div className="overlay" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, pointerEvents: "none" }}>
          <HUD text={hud} />
          <div
            className="hud-card"
            style={{
              pointerEvents: "auto",
              padding: "12px 14px",
              display: "grid",
              gap: 8,
              maxWidth: 360,
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Portfolio</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                onClick={() => setShowProof(true)}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(150,190,255,0.35)",
                  background: "rgba(12,18,26,0.85)",
                  color: "#e9f2ff",
                  fontWeight: 800,
                }}
              >
                CV anzeigen
              </button>
              <button
                onClick={() => setBubbles((prev) => ["[INFO] Projekte → Taste 1 oder Portal links", ...prev].slice(0, 5))}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(150,190,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e9f2ff",
                  fontWeight: 700,
                }}
              >
                Projekte
              </button>
              <button
                onClick={() => setBubbles((prev) => ["[INFO] Kontakt → hello@example.com", ...prev].slice(0, 5))}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(150,190,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e9f2ff",
                  fontWeight: 700,
                }}
              >
                Kontakt
              </button>
            </div>
          </div>
        </div>
        <BubbleHUD bubbles={bubbles} />
        {showProof && <ProofPanel onClose={() => setShowProof(false)} />}
      </div>
      <TouchControls input={input} />
    </div>
  );
}
