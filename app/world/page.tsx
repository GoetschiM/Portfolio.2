"use client";

import { useEffect, useState } from "react";
import { AnchorApi, WorldCanvas } from "@/components/world/WorldCanvas";
import HUD from "@/components/ui/HUD";
import BubbleHUD from "@/components/ui/BubbleHUD";
import ProofPanel from "@/components/ui/ProofPanel";
import TouchControls from "@/components/ui/TouchControls";
import { Input } from "@/components/world/Input";

export default function WorldPage() {
  const [hud, setHud] = useState(
    "Schwebe-Insel: Immer nach vorne laufen • WASD/Pfeile • Shift Sprint • 1 Projekte (links) • 2 Karriere (rechts) • 3 Startplateau",
  );
  const [bubbles, setBubbles] = useState<string[]>([]);
  const [showProof, setShowProof] = useState(false);
  const [input, setInput] = useState<Input | null>(null);
  const [audioMuted, setAudioMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [anchor, setAnchor] = useState<AnchorApi | null>(null);

  const pushBubble = (text: string) => setBubbles((prev) => [text, ...prev].slice(0, 5));

  const ensureAnchor = (fn: (() => void) | null | undefined) => {
    if (!fn) {
      pushBubble("[INFO] Navigation lädt noch – bitte kurz warten");
      return false;
    }
    fn();
    return true;
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const handle = (ev: MediaQueryListEvent | MediaQueryList) => {
      setIsCompact(ev.matches);
      if (!ev.matches) setMenuOpen(true);
    };
    handle(media);
    media.addEventListener("change", handle);
    return () => media.removeEventListener("change", handle);
  }, []);

  return (
    <div className="canvas-host">
      <WorldCanvas
        onHudChange={setHud}
        onBubble={pushBubble}
        onProof={setShowProof}
        onInputReady={setInput}
        muted={audioMuted}
        onAnchorReady={setAnchor}
      />
      <div className="overlay" style={{ padding: 14 }}>
        <HUD text={hud} />
        <div
          className="hud-card"
          style={{
            position: "absolute",
            right: 12,
            top: isCompact ? 96 : 12,
            width: isCompact ? "calc(100% - 24px)" : 340,
            maxWidth: 420,
            padding: "12px 14px",
            display: "grid",
            gap: 10,
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>
                Insel-Navigation
              </div>
              <div style={{ fontWeight: 850, marginTop: 4 }}>CV, Projekte, Kontakt</div>
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
                  background: "rgba(12,18,26,0.9)",
                  color: "#e9f2ff",
                  fontWeight: 800,
                  letterSpacing: 0.3,
                }}
              >
                {menuOpen ? "Schließen" : "Menü"}
              </button>
            )}
          </div>

          {(!isCompact || menuOpen) && (
            <div style={{ display: "grid", gap: 8 }}>
              <button
                onClick={() => {
                  if (ensureAnchor(anchor?.goCareer)) {
                    setShowProof(true);
                    pushBubble("[INFO] CV-Pfad → Taste 2 oder rechter Weg");
                  }
                }}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(150,190,255,0.35)",
                  background: "linear-gradient(180deg, rgba(12,18,26,0.9), rgba(5,9,14,0.9))",
                  color: "#e9f2ff",
                  fontWeight: 850,
                }}
              >
                CV anzeigen
              </button>
              <button
                onClick={() => {
                  if (ensureAnchor(anchor?.goProjects)) {
                    pushBubble("[INFO] Projekte → Taste 1 oder linker Pfad");
                  }
                }}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(150,190,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e9f2ff",
                  fontWeight: 750,
                }}
              >
                Projekte
              </button>
              <button
                onClick={() => {
                  if (ensureAnchor(anchor?.goIntro)) {
                    pushBubble("[INFO] Kontakt → michel.goetschi@gmail.com (öffnet Mail)");
                    if (typeof window !== "undefined") {
                      window.open("mailto:michel.goetschi@gmail.com?subject=Portfolio%20Anfrage", "_blank");
                    }
                  }
                }}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(150,190,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e9f2ff",
                  fontWeight: 750,
                }}
              >
                Kontakt
              </button>
            </div>
          )}
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
              <span style={{ fontWeight: 800 }}>{audioMuted ? "Mute aktiv" : "Hintergrundmusik"}</span>
              <span style={{ opacity: 0.75, fontSize: 12 }}>
                {audioMuted ? "Tippen zum Einschalten" : "Sanfte Melodie läuft"}
              </span>
            </div>
          </button>
        </div>
      </div>
      <TouchControls input={input} />
    </div>
  );
}
