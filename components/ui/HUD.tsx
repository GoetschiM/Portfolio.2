interface HUDProps {
  text: string;
}

export default function HUD({ text }: HUDProps) {
  return (
    <div
      className="hud-card"
      style={{
        position: "absolute",
        left: 12,
        top: 12,
        padding: "12px 14px",
        maxWidth: "560px",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Controls</div>
      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700 }}>{text}</div>
    </div>
  );
}
