interface BubbleHUDProps {
  bubbles: string[];
}

export default function BubbleHUD({ bubbles }: BubbleHUDProps) {
  if (!bubbles.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 14,
        bottom: 14,
        display: "grid",
        gap: 8,
        pointerEvents: "none",
        maxWidth: "min(560px, 92vw)",
        color: "rgba(245,252,255,0.96)",
        fontSize: 13,
      }}
    >
      {bubbles.map((text, idx) => (
        <div
          key={`${text}-${idx}`}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            background: "linear-gradient(180deg, rgba(8,12,18,0.78), rgba(3,5,8,0.55))",
            border: "1px solid rgba(150,190,255,0.18)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
            opacity: 0.94 - idx * 0.12,
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}
