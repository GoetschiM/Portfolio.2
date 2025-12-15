interface ProofPanelProps {
  onClose: () => void;
}

export default function ProofPanel({ onClose }: ProofPanelProps) {
  return (
    <div className="overlay" style={{ display: "grid", placeItems: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
        }}
        onClick={onClose}
      />
      <div
        className="hud-card"
        style={{
          width: "min(940px, 94vw)",
          maxHeight: "min(640px, 86vh)",
          overflow: "auto",
          padding: 18,
          color: "rgba(245,252,255,0.96)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.6, opacity: 0.85, textTransform: "uppercase" }}>CV & Download</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 950 }}>Portfolio auf einen Blick</div>
            <div style={{ marginTop: 8, fontSize: 15, opacity: 0.9, lineHeight: 1.55 }}>
              Projekte, Wertegang und Assets an einem Ort. Der Download liefert das CV als PDF; die Kacheln zeigen die wichtigsten
              Stationen und Kapitel.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              cursor: "pointer",
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(245,252,255,0.96)",
              fontWeight: 900,
            }}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <a
            href="/cv.pdf"
            style={{
              padding: "12px 12px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.24)",
              fontSize: 14,
              opacity: 0.98,
              color: "inherit",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            CV als PDF herunterladen (Platzhalter)
          </a>
          {["XR/AI Experience Design", "Backbone: Next.js + Three.js", "Teleport-Navigation (1-4)", "Projekte & CV als zwei Pfade"].map(
            (b) => (
              <div
                key={b}
                style={{
                  padding: "12px 12px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontSize: 14,
                  opacity: 0.98,
                }}
              >
                {b}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
