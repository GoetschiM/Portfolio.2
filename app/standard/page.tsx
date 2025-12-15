import Link from "next/link";

const experiences = [
  { years: "2024–Present", title: "AI & Quality Engineering Specialist", company: "SWICA" },
  { years: "2022–2023", title: "Infrastructure & Systems Engineer", company: "Swiss Post" },
  { years: "2019–2020", title: "System Engineer", company: "SBB" },
  { years: "2015–2017", title: "ICT Systemspecialist", company: "Die Post" },
];

const skills = [
  "Linux, Windows, macOS",
  "Virtualisierung: ESXi, Proxmox, Hyper-V",
  "Netzwerk & Security",
  "Monitoring & Observability",
  "Automation & Scripting",
  "Voice/Video: Zoom, Teams, VoIP",
];

export default function StandardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "72px 18px",
        background:
          "radial-gradient(circle at 20% 20%, rgba(68, 143, 255, 0.16), transparent 42%), radial-gradient(circle at 80% 10%, rgba(43, 214, 123, 0.14), transparent 36%), #05090f",
        color: "#e9f2ff",
      }}
    >
      <div className="hud-card" style={{ maxWidth: 960, width: "100%", padding: "26px", display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.6, opacity: 0.82, textTransform: "uppercase" }}>Standard-Ansicht</div>
            <h1 style={{ margin: "8px 0", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900 }}>Michel Götschi</h1>
            <div style={{ opacity: 0.82 }}>ICT Specialist – System Engineering | Automation | Support Leadership</div>
          </div>
          <Link
            href="/world"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(150,190,255,0.35)",
              background: "rgba(12,18,26,0.85)",
              fontWeight: 800,
            }}
          >
            Zur 3D-Welt
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <div className="hud-card" style={{ padding: 16, borderStyle: "dashed" }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Kurzprofil</div>
            <p style={{ marginTop: 8, lineHeight: 1.55, opacity: 0.9 }}>
              IT-Spezialist mit breitem Tech-Stack, Automationsfokus und Leadership-Erfahrung. Bringt komplexe Plattformen zum
              Laufen, optimiert Kosten und sorgt für stabile User-Erlebnisse.
            </p>
            <Link href="/cv.pdf" style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
              📄 CV als PDF (Platzhalter)
            </Link>
          </div>

          <div className="hud-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Kontakt</div>
            <div style={{ marginTop: 8, display: "grid", gap: 6, opacity: 0.9 }}>
              <span>michel.goetschi@gmail.com</span>
              <span>+41 79 597 10 27</span>
              <span>Zürich, Schweiz</span>
            </div>
          </div>
        </div>

        <div className="hud-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Erfahrung</div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {experiences.map((item) => (
              <div
                key={item.title + item.years}
                style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}
              >
                <div style={{ fontWeight: 800 }}>{item.title}</div>
                <div style={{ opacity: 0.8 }}>{item.company}</div>
                <div style={{ opacity: 0.7 }}>{item.years}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <div className="hud-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Tech Skills</div>
            <ul style={{ marginTop: 10, display: "grid", gap: 6, paddingLeft: 16, opacity: 0.9 }}>
              {skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="hud-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.82, textTransform: "uppercase" }}>Soft Skills</div>
            <ul style={{ marginTop: 10, display: "grid", gap: 6, paddingLeft: 16, opacity: 0.9 }}>
              <li>Leadership & Coaching</li>
              <li>Storytelling & Stakeholder-Kommunikation</li>
              <li>Service-Ownership & Priorisierung</li>
              <li>Problem-Solving unter Druck</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
