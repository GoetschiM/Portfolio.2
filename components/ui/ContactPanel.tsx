interface ContactPanelProps {
  onClose: () => void;
}

export default function ContactPanel({ onClose }: ContactPanelProps) {
  return (
    <div
      className="overlay"
      style={{ display: "grid", placeItems: "center", pointerEvents: "auto" }}
    >
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
          width: "min(840px, 94vw)",
          maxHeight: "min(640px, 86vh)",
          overflow: "auto",
          padding: 18,
          color: "rgba(245,252,255,0.96)",
          backdropFilter: "blur(10px)",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.6, opacity: 0.85, textTransform: "uppercase" }}>Kontakt</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 950 }}>Bleiben wir in Kontakt</div>
            <div style={{ marginTop: 8, fontSize: 15, opacity: 0.9, lineHeight: 1.55 }}>
              Kurze Wege statt Mailto-Only: Wähle einen Kanal oder kopiere die Daten direkt. Ein echtes Formular folgt später.
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

        <div style={{ display: "grid", gap: 10 }}>
          <a
            href="mailto:michel.goetschi@gmail.com?subject=Portfolio%20Anfrage"
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
            E-Mail öffnen (mailto)
          </a>
          <div
            style={{
              padding: "12px 12px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              fontSize: 14,
              opacity: 0.98,
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 850 }}>Direktdaten</div>
            <div style={{ display: "grid", gap: 4 }}>
              <div>Mail: michel.goetschi@gmail.com</div>
              <div>LinkedIn: linkedin.com/in/michelgoetschi</div>
              <div>GitHub: github.com/michelgoetschi</div>
            </div>
          </div>
          <div
            style={{
              padding: "12px 12px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              fontSize: 14,
              opacity: 0.98,
            }}
          >
            Nächster Schritt: Kurzes Formular mit Nachricht + Rückrufzeit und ein Copy-to-Clipboard für alle Kanäle.
          </div>
        </div>
      </div>
    </div>
  );
}
