import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "88px 24px",
        background:
          "radial-gradient(circle at 20% 20%, rgba(68, 143, 255, 0.18), transparent 42%), radial-gradient(circle at 80% 10%, rgba(43, 214, 123, 0.16), transparent 36%), #05090f",
      }}
    >
      <div className="hud-card" style={{ padding: "26px", maxWidth: 980, width: "100%", display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: 1.6, opacity: 0.85, textTransform: "uppercase" }}>Willkommen</div>
          <h1 style={{ margin: 0, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900 }}>Portfolio von Michel Götschi</h1>
          <p style={{ opacity: 0.88, lineHeight: 1.65, fontSize: 15 }}>
            Neue Welt, neues Layout: Statt eines flachen Grids wartet jetzt eine schwebende Insel mit klaren Pfaden für Projekte
            und Karriere. Kamera, Steuerung und Zoom bleiben präzise – aber das Erlebnis ist luftiger, aufgeräumter und mobile-fit.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/world"
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(150,190,255,0.45)",
              background: "linear-gradient(180deg, rgba(8,12,18,0.9), rgba(3,5,8,0.7))",
              fontWeight: 850,
            }}
          >
            Welt betreten
          </Link>
          <Link
            href="/standard"
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(150,190,255,0.35)",
              background: "rgba(255,255,255,0.06)",
              fontWeight: 800,
            }}
          >
            Standard
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}
        >
          <div className="hud-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Neu</div>
            <div style={{ fontWeight: 850, marginTop: 6 }}>Schwebende Diorama-Insel</div>
            <div style={{ opacity: 0.88, marginTop: 6, lineHeight: 1.5 }}>
              Insel-Look wie auf den Referenzbildern: Pools, Plateaus, Baumgruppen, leuchtende Pfade und ein kleines Cabin-Setpiece
              statt AI-Raum.
            </div>
          </div>
          <div className="hud-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Navigation</div>
            <div style={{ fontWeight: 850, marginTop: 6 }}>Tasten 1–3 & Touch</div>
            <div style={{ opacity: 0.88, marginTop: 6, lineHeight: 1.5 }}>
              1 = Projekte (links), 2 = Karriere/CV (rechts), 3 = Startplateau. WASD/Touch-DPad & Sprint bleiben wie gehabt.
            </div>
          </div>
          <div className="hud-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Overlay</div>
            <div style={{ fontWeight: 850, marginTop: 6 }}>Mobile-tauglich</div>
            <div style={{ opacity: 0.88, marginTop: 6, lineHeight: 1.5 }}>
              HUD auf der linken Seite, Navigation rechts als eigene Karte; keine überlappenden Menüs mehr.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
