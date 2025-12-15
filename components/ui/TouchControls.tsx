"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/world/Input";

interface TouchControlsProps {
  input: Input | null;
}

export default function TouchControls({ input }: TouchControlsProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!input) return;
    const enable = () => {
      const prefersTouch = window.matchMedia("(pointer: coarse)").matches;
      setActive(prefersTouch);
    };
    enable();
  }, [input]);

  const makePress = useCallback(
    (code: string) => ({
      onTouchStart: () => input?.setVirtual(code, true),
      onTouchEnd: () => input?.setVirtual(code, false),
      onMouseDown: () => input?.setVirtual(code, true),
      onMouseUp: () => input?.setVirtual(code, false),
      onMouseLeave: () => input?.setVirtual(code, false),
    }),
    [input],
  );

  if (!active) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        display: "grid",
        gap: 10,
        padding: 10,
        borderRadius: 18,
        backdropFilter: "blur(12px)",
        background: "rgba(5, 8, 14, 0.55)",
        border: "1px solid rgba(150,190,255,0.25)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
        userSelect: "none",
        zIndex: 30,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Touch</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(2, 48px)", gap: 8 }}>
        <div />
        <button className="touch-key" aria-label="vor" {...makePress("KeyW")}>
          ▲
        </button>
        <div />
        <button className="touch-key" aria-label="links" {...makePress("KeyA")}>
          ◀
        </button>
        <button className="touch-key" aria-label="unten" {...makePress("KeyS")}>
          ▼
        </button>
        <button className="touch-key" aria-label="rechts" {...makePress("KeyD")}>
          ▶
        </button>
      </div>
    </div>
  );
}
