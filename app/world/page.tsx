"use client";

import { useEffect, useState } from "react";
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
  const [audioMuted, setAudioMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const handle = (ev: MediaQueryListEvent | MediaQueryList) => {
      setIsCompact(ev.matches);
      if (!ev.matches) setMenuOpen(false);
    };
    handle(media);
    media.addEventListener("change", handle);
    return () => media.removeEventListener("change", handle);
  }, []);

  return (
    <div className="canvas-host">
      <WorldCanvas
        onHudChange={setHud}
        onBubble={(b) => setBubbles((prev) => [b, ...prev].slice(0, 5))}
        onProof={setShowProof}
        onInputReady={setInput}
        muted={audioMuted}
      />
      <div className="overlay" style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            flexDirection: isCompact ? "column" : "row",
            alignItems: isCompact ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <HUD text={hud} />
          <div style={{ display: "grid", gap: 8, pointerEvents: "auto", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>
                Portfolio Navigation
              </div>
              {isCompact && (
                <button
                  aria-label="Menü umschalten"
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(150,190,255,0.35)",
                    background: "rgba(12,18,26,0.85)",
                    color: "#e9f2ff",
                    fontWeight: 800,
                    letterSpacing: 0.3,
                  }}
                >
                  {menuOpen ? "Schließen" : "Menü"}
                </button>
              )}
            </div>
            {(menuOpen || !isCompact) && (
              <div
                className="hud-card"
                style={{
                  padding: "12px 14px",
                  display: "grid",
                  gap: 8,
                  maxWidth: isCompact ? "100%" : 360,
                }}
              >
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
                    onClick={() =>
                      setBubbles((prev) => ["[INFO] Projekte → Taste 1 oder Portal links", ...prev].slice(0, 5))
                    }
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
                    onClick={() => setBubbles((prev) => ["[INFO] Kontakt → michel.goetschi@gmail.com", ...prev].slice(0, 5))}
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
            )}
          </div>
        </div>
        <BubbleHUD bubbles={bubbles} />
        {showProof && <ProofPanel onClose={() => setShowProof(false)} />}
        <div
          style={{
            position: "fixed",
            right: isCompact ? 12 : 18,
            bottom: isCompact ? 12 : 18,
            pointerEvents: "auto",
          }}
        >
          <button
            aria-label={audioMuted ? "Audio einschalten" : "Audio stummschalten"}
            onClick={() => setAudioMuted((m) => !m)}
            className="audio-toggle"
          >
            <span style={{ fontSize: 18 }}>{audioMuted ? "🔇" : "🔊"}</span>
            <div style={{ display: "grid", gap: 2, textAlign: "left" }}>
              <span style={{ fontSize: 12, letterSpacing: 1.2, opacity: 0.8, textTransform: "uppercase" }}>Sound</span>
              <span style={{ fontWeight: 800 }}>{audioMuted ? "Mute aktiv" : "Klang an"}</span>
              <span style={{ opacity: 0.75, fontSize: 12 }}>
                {audioMuted ? "Tippen zum Einschalten" : "Wind & Schritte hörbar"}
              </span>
            </div>
          </button>
        </div>
      </div>
      <TouchControls input={input} />
    </div>
  );
}
