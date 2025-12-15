import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "72px 24px",
      }}
    >
      <div
        className="hud-card"
        style={{
          padding: "24px",
          maxWidth: "720px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 13, letterSpacing: 1.6, opacity: 0.85, textTransform: "uppercase" }}>Portfolio World</div>
        <h1 style={{ margin: "12px 0 8px", fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 900 }}>
          Zwei Pfade: Projekte & CV
        </h1>
        <p style={{ opacity: 0.84, lineHeight: 1.6, fontSize: 15 }}>
          Vollbild-Experience auf Basis von Next.js + Three.js. Starte auf einer schwebenden Insel mit Vignette-Fokus, wähle den
          Projekte- oder CV-Pfad (Tasten 1–4 oder Portale) und teleportiere per Enter in den AI Room. Touch-Steuerung, HUD und
          CV-Popup sind integriert.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <Link
            href="/world"
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(150,190,255,0.45)",
              background: "linear-gradient(180deg, rgba(8,12,18,0.82), rgba(3,5,8,0.62))",
              fontWeight: 800,
            }}
          >
            Welt betreten
          </Link>
          <Link
            href="https://threejs.org/"
            target="_blank"
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(150,190,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              fontWeight: 700,
              opacity: 0.9,
            }}
          >
            Three.js Docs
          </Link>
        </div>
      </div>
    </main>
  );
}
